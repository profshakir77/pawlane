import { prisma } from "./db";
import { getSupplier } from "./suppliers";
import type { ShippingAddress } from "./suppliers/types";

// Sends a paid order to each supplier involved. Safe to call again: suppliers
// that already have a fulfilment for this order are skipped.
export async function forwardOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { variant: { include: { product: true } } } }, fulfillments: true },
  });
  if (!order) throw new Error("Order not found");
  if (!["PAID", "FAILED", "SENT_TO_SUPPLIER"].includes(order.status)) return order;
  if (!order.shippingAddress) throw new Error("Order has no shipping address");
  // Never send a test payment to the supplier: it would place (and maybe pay for) a real order.
  const testPayment =
    (order.paymentProvider === "safepay" && process.env.SAFEPAY_ENV !== "production") ||
    (order.paymentProvider === "stripe" && (process.env.STRIPE_SECRET_KEY ?? "").startsWith("sk_test"));
  if (testPayment) throw new Error("Test payment (sandbox): not sent to supplier");

  const shipping = order.shippingAddress as unknown as ShippingAddress;
  const bySupplier = new Map<string, { supplierVariantId: string; quantity: number }[]>();
  for (const item of order.items) {
    const s = item.variant.product.supplier;
    if (!bySupplier.has(s)) bySupplier.set(s, []);
    bySupplier.get(s)!.push({ supplierVariantId: item.variant.supplierVariantId, quantity: item.quantity });
  }

  const done = new Set(order.fulfillments.map((f) => f.supplier));
  try {
    for (const [supplier, items] of bySupplier) {
      if (done.has(supplier)) continue;
      const { supplierOrderId } = await getSupplier(supplier).createOrder({
        reference: `PL${order.number}`,
        shipping: { ...shipping, email: order.email ?? undefined },
        items,
      });
      await prisma.fulfillment.create({ data: { orderId, supplier, supplierOrderId } });
    }
    return prisma.order.update({ where: { id: orderId }, data: { status: "SENT_TO_SUPPLIER", error: null } });
  } catch (e) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status: "FAILED", error: String(e instanceof Error ? e.message : e).slice(0, 500) },
    });
  }
}
