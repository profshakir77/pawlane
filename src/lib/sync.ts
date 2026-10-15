import { prisma } from "./db";
import { forwardOrder } from "./fulfillment";
import { compareAtPrice, retailPrice } from "./pricing";
import { getSupplier } from "./suppliers";

async function log(kind: string, ok: boolean, message: string) {
  await prisma.syncLog.create({ data: { kind, ok, message: message.slice(0, 1000) } });
}

// Refresh supplier cost and stock; reprice unless the product is price-locked.
export async function syncProducts() {
  const products = await prisma.product.findMany({ where: { active: true }, include: { variants: true } });
  let updated = 0, hidden = 0;
  const errors: string[] = [];

  for (const p of products) {
    try {
      const adapter = getSupplier(p.supplier);
      const sp = await adapter.getProduct(p.supplierProductId);
      if (!sp) {
        await prisma.product.update({ where: { id: p.id }, data: { active: false } });
        hidden++;
        continue;
      }
      const stock = await adapter.getStock(p.variants.map((v) => v.supplierVariantId));
      for (const v of p.variants) {
        const sv = sp.variants.find((x) => x.supplierVariantId === v.supplierVariantId);
        if (!sv) {
          await prisma.variant.update({ where: { id: v.id }, data: { stock: 0 } });
          continue;
        }
        const price = p.priceLocked ? v.priceCents : retailPrice(sv.costCents);
        await prisma.variant.update({
          where: { id: v.id },
          data: {
            costCents: sv.costCents,
            priceCents: price,
            compareAtCents: p.priceLocked ? v.compareAtCents : compareAtPrice(price),
            stock: stock[v.supplierVariantId] ?? sv.stock ?? v.stock,
          },
        });
        if (p.priceLocked && sv.costCents >= v.priceCents) {
          errors.push(`${p.title} / ${v.name}: cost is now above your locked price`);
        }
      }
      await prisma.product.update({ where: { id: p.id }, data: { lastSyncedAt: new Date() } });
      updated++;
    } catch (e) {
      errors.push(`${p.title}: ${e instanceof Error ? e.message : e}`);
    }
  }
  const msg = `Updated ${updated}, hidden ${hidden}${errors.length ? `. Issues: ${errors.join("; ")}` : ""}`;
  await log("products", errors.length === 0, msg);
  return { updated, hidden, errors };
}

// Pull tracking numbers and push order status forward.
export async function syncTracking() {
  const fulfillments = await prisma.fulfillment.findMany({
    where: { status: { in: ["processing", "shipped"] } },
    take: 200,
  });
  let changed = 0;
  for (const f of fulfillments) {
    try {
      const t = await getSupplier(f.supplier).getTracking(f.supplierOrderId);
      if (t.status !== f.status || t.trackingNumber !== f.trackingNumber) {
        await prisma.fulfillment.update({
          where: { id: f.id },
          data: { status: t.status, trackingNumber: t.trackingNumber, carrier: t.carrier, trackingUrl: t.trackingUrl },
        });
        changed++;
      }
    } catch (e) {
      await log("tracking", false, `${f.supplierOrderId}: ${e instanceof Error ? e.message : e}`);
    }
  }

  // Roll fulfilment status up to the order.
  const orders = await prisma.order.findMany({
    where: { status: { in: ["SENT_TO_SUPPLIER", "SHIPPED"] } },
    include: { fulfillments: true },
  });
  for (const o of orders) {
    const s = o.fulfillments.map((f) => f.status);
    const next = s.length && s.every((x) => x === "delivered") ? "DELIVERED"
      : s.length && s.every((x) => x === "shipped" || x === "delivered") ? "SHIPPED" : o.status;
    if (next !== o.status) await prisma.order.update({ where: { id: o.id }, data: { status: next } });
  }
  await log("tracking", true, `Checked ${fulfillments.length}, changed ${changed}`);
  return { checked: fulfillments.length, changed };
}

// Paid orders that never reached the supplier (e.g. supplier API was down).
export async function retryUnsent() {
  const stuck = await prisma.order.findMany({
    where: { status: "PAID", updatedAt: { lt: new Date(Date.now() - 5 * 60 * 1000) } },
    take: 50,
  });
  for (const o of stuck) await forwardOrder(o.id);
  return { retried: stuck.length };
}

export async function runAllSyncs() {
  const products = await syncProducts();
  const tracking = await syncTracking();
  const retries = process.env.AUTO_FULFILL === "true" ? await retryUnsent() : { retried: 0 };
  return { products, tracking, retries };
}
