import { prisma } from "./db";
import { sendCheckoutReminder } from "./email";

// Abandoned checkout reminders. Runs with the daily cron.
// An order counts as abandoned when it was started (email given) more than
// 2 hours ago, less than 3 days ago, was never paid, and that email hasn't
// placed a paid order since. Each order gets one reminder, ever.
export async function sendAbandonedCheckoutReminders() {
  const now = Date.now();
  const pending = await prisma.order.findMany({
    where: {
      status: "PENDING",
      email: { not: null },
      createdAt: { lt: new Date(now - 2 * 3600_000), gt: new Date(now - 3 * 86400_000) },
    },
    include: { items: { include: { variant: { include: { product: { select: { slug: true, title: true } } } } } } },
    orderBy: { createdAt: "desc" },
  });

  let sent = 0;
  const done = new Set<string>();
  for (const o of pending) {
    const email = o.email!.toLowerCase();
    if (done.has(email)) continue; // one email per person, about their latest attempt
    done.add(email);

    const key = `recovery:${o.id}`;
    if (await prisma.setting.findUnique({ where: { key } })) continue;
    const paid = await prisma.order.count({
      where: { email: { equals: o.email!, mode: "insensitive" }, status: { notIn: ["PENDING", "CANCELLED", "FAILED"] }, createdAt: { gte: o.createdAt } },
    });
    if (paid > 0) continue;

    try {
      const ok = await sendCheckoutReminder({
        email: o.email!,
        name: o.name,
        items: o.items.map((i) => ({ title: i.variant.product.title, quantity: i.quantity, slug: i.variant.product.slug })),
      });
      if (!ok) return { sent, skipped: "email not configured" };
      await prisma.setting.create({ data: { key, value: new Date().toISOString() } });
      sent++;
    } catch (e) {
      await prisma.syncLog.create({ data: { kind: "recovery", ok: false, message: String(e).slice(0, 300) } });
    }
  }
  if (sent) await prisma.syncLog.create({ data: { kind: "recovery", ok: true, message: `Sent ${sent} checkout reminder(s)` } });
  return { sent };
}
