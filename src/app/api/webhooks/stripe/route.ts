import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { forwardOrder } from "@/lib/fulfillment";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, req.headers.get("stripe-signature") ?? "", process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session & { collected_information?: any };
    const orderId = s.metadata?.orderId;
    if (!orderId) return NextResponse.json({ ok: true });

    const ship = s.collected_information?.shipping_details ?? (s as any).shipping_details;
    const addr = ship?.address ?? s.customer_details?.address;
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order || order.status !== "PENDING") return NextResponse.json({ ok: true }); // already handled

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          email: s.customer_details?.email,
          name: ship?.name ?? s.customer_details?.name,
          phone: s.customer_details?.phone,
          shippingAddress: {
            name: ship?.name ?? s.customer_details?.name ?? "",
            phone: s.customer_details?.phone ?? "",
            line1: addr?.line1 ?? "",
            line2: addr?.line2 ?? undefined,
            city: addr?.city ?? "",
            state: addr?.state ?? undefined,
            postalCode: addr?.postal_code ?? "",
            countryCode: addr?.country ?? "",
          },
        },
      }),
      ...order.items.map((i) =>
        prisma.variant.update({ where: { id: i.variantId }, data: { stock: { decrement: i.quantity } } }),
      ),
    ]);

    if (process.env.AUTO_FULFILL === "true") await forwardOrder(orderId);
  }

  if (event.type === "checkout.session.expired") {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.metadata?.orderId) {
      await prisma.order.updateMany({ where: { id: s.metadata.orderId, status: "PENDING" }, data: { status: "CANCELLED" } });
    }
  }

  return NextResponse.json({ ok: true });
}
