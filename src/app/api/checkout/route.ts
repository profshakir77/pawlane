import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { SHIP_COUNTRIES, stripe } from "@/lib/stripe";
import { bundleDiscountCents } from "@/lib/bundles";
import { createSafepayTracker, safepayCheckoutUrl, safepayEnabled } from "@/lib/safepay";

const Customer = z.object({
  email: z.string().email().max(200),
  name: z.string().min(2).max(120),
  phone: z.string().min(5).max(40),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional().or(z.literal("")),
  city: z.string().min(2).max(100),
  state: z.string().max(100).optional().or(z.literal("")),
  postalCode: z.string().min(2).max(20),
  countryCode: z.enum(SHIP_COUNTRIES),
});

const Body = z.object({
  items: z.array(z.object({ variantId: z.string(), quantity: z.number().int().min(1).max(20) })).min(1).max(30),
  customer: Customer.optional(),
});

// Which gateway takes the money. Safepay settles to a Pakistani bank account;
// Stripe is kept for anyone running this store from a Stripe-supported country.
function provider(): "safepay" | "stripe" | null {
  const pref = process.env.PAYMENT_PROVIDER;
  if (pref === "stripe" && process.env.STRIPE_SECRET_KEY) return "stripe";
  if (pref === "safepay" && safepayEnabled()) return "safepay";
  if (safepayEnabled()) return "safepay";
  if (process.env.STRIPE_SECRET_KEY) return "stripe";
  return null;
}

export async function POST(req: Request) {
  const gateway = provider();
  if (!gateway) {
    return NextResponse.json({ error: "Checkout opens soon. We're finishing payment setup, please check back shortly." }, { status: 503 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check your details and try again." }, { status: 400 });
  const { customer } = parsed.data;
  if (gateway === "safepay" && !customer) {
    return NextResponse.json({ error: "Please fill in your shipping details." }, { status: 400 });
  }

  // Always price from the database, never from the browser.
  const ids = parsed.data.items.map((i) => i.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: ids }, product: { active: true } },
    include: { product: true },
  });
  const lines = parsed.data.items
    .map((i) => ({ ...i, v: variants.find((v) => v.id === i.variantId) }))
    .filter((l): l is typeof l & { v: NonNullable<typeof l.v> } => !!l.v);

  if (lines.length !== parsed.data.items.length) {
    return NextResponse.json({ error: "Some items are no longer available. Remove them and try again." }, { status: 409 });
  }
  const soldOut = lines.find((l) => l.v.stock < l.quantity);
  if (soldOut) {
    return NextResponse.json({ error: `${soldOut.v.product.title} (${soldOut.v.name}) has only ${soldOut.v.stock} left.` }, { status: 409 });
  }

  const itemsCents = lines.reduce((s, l) => s + l.v.priceCents * l.quantity, 0);
  const discountCents = bundleDiscountCents(lines.map((l) => ({ slug: l.v.product.slug, priceCents: l.v.priceCents, quantity: l.quantity })));
  const subtotalCents = itemsCents - discountCents;
  const order = await prisma.order.create({
    data: {
      subtotalCents,
      costCents: lines.reduce((s, l) => s + l.v.costCents * l.quantity, 0),
      paymentProvider: gateway,
      ...(customer && {
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        shippingAddress: {
          name: customer.name,
          phone: customer.phone,
          line1: customer.line1,
          line2: customer.line2 || undefined,
          city: customer.city,
          state: customer.state || undefined,
          postalCode: customer.postalCode,
          countryCode: customer.countryCode,
        },
      }),
      items: {
        create: lines.map((l) => ({
          variantId: l.v.id,
          title: `${l.v.product.title} (${l.v.name})`,
          quantity: l.quantity,
          unitPriceCents: l.v.priceCents,
          unitCostCents: l.v.costCents,
        })),
      },
    },
  });

  const site = SITE_URL;

  if (gateway === "safepay") {
    try {
      const token = await createSafepayTracker(Math.round(subtotalCents) / 100);
      await prisma.order.update({ where: { id: order.id }, data: { paymentRef: token } });
      const url = safepayCheckoutUrl({
        token,
        orderId: String(order.number),
        redirectUrl: `${site}/api/payments/safepay?order=${order.number}`,
        cancelUrl: `${site}/checkout?cancelled=1`,
      });
      return NextResponse.json({ url, order: order.number, value: subtotalCents / 100 });
    } catch (e) {
      await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED", error: String(e).slice(0, 500) } });
      return NextResponse.json({ error: "We couldn't reach the payment page. Please try again in a minute." }, { status: 502 });
    }
  }

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: customer?.email,
    line_items: lines.map((l) => ({
      quantity: l.quantity,
      price_data: {
        currency: "usd",
        unit_amount: l.v.priceCents,
        product_data: {
          name: l.v.product.title,
          description: l.v.name,
          images: [l.v.image || l.v.product.images[0]].filter(Boolean).slice(0, 1) as string[],
        },
      },
    })),
    shipping_address_collection: { allowed_countries: [...SHIP_COUNTRIES] },
    phone_number_collection: { enabled: true },
    shipping_options: [{
      shipping_rate_data: {
        display_name: "Free tracked shipping",
        type: "fixed_amount",
        fixed_amount: { amount: 0, currency: "usd" },
        delivery_estimate: { minimum: { unit: "business_day", value: 7 }, maximum: { unit: "business_day", value: 15 } },
      },
    }],
    // Stripe can't combine a fixed discount with promo codes, so bundles use a one-off coupon.
    ...(discountCents > 0
      ? { discounts: [{ coupon: (await stripe().coupons.create({ amount_off: discountCents, currency: "usd", duration: "once", name: "Bundle saving", max_redemptions: 1 })).id }] }
      : { allow_promotion_codes: true }),
    metadata: { orderId: order.id },
    success_url: `${site}/checkout/success?order=${order.number}&v=${(subtotalCents / 100).toFixed(2)}`,
    cancel_url: `${site}/cart`,
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id, paymentRef: session.id } });
  return NextResponse.json({ url: session.url, order: order.number, value: subtotalCents / 100 });
}
