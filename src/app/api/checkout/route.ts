import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { SITE_URL } from "@/lib/seo";
import { SHIP_COUNTRIES, stripe } from "@/lib/stripe";

const Body = z.object({
  items: z.array(z.object({ variantId: z.string(), quantity: z.number().int().min(1).max(20) })).min(1).max(30),
});

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Checkout is not set up yet. Add a Stripe key to start taking orders." }, { status: 503 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Your cart is not valid. Refresh and try again." }, { status: 400 });

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

  const order = await prisma.order.create({
    data: {
      subtotalCents: lines.reduce((s, l) => s + l.v.priceCents * l.quantity, 0),
      costCents: lines.reduce((s, l) => s + l.v.costCents * l.quantity, 0),
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
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
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
    allow_promotion_codes: true,
    metadata: { orderId: order.id },
    success_url: `${site}/checkout/success?order=${order.number}`,
    cancel_url: `${site}/cart`,
  });

  await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } });
  return NextResponse.json({ url: session.url });
}
