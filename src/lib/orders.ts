import { prisma } from "./db";
import { forwardOrder } from "./fulfillment";

/**
 * Marks a PENDING order as paid, takes the stock and (optionally) sends it to
 * the supplier. Safe to call twice: only the first call does anything.
 */
export async function markOrderPaid(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return null;
  if (order.status !== "PENDING") return order;

  const claimed = await prisma.order.updateMany({ where: { id: orderId, status: "PENDING" }, data: { status: "PAID" } });
  if (claimed.count === 0) return order; // another request got there first

  await prisma.$transaction(
    order.items.map((i) => prisma.variant.update({ where: { id: i.variantId }, data: { stock: { decrement: i.quantity } } })),
  );

  if (process.env.AUTO_FULFILL === "true") {
    try { await forwardOrder(orderId); } catch (e) {
      await prisma.order.update({ where: { id: orderId }, data: { error: String(e).slice(0, 500) } });
    }
  }
  return order;
}
