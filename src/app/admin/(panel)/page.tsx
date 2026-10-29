import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/currency";
import { paymentFeeCents } from "@/lib/fees";
import { syncNow } from "../actions";

export const dynamic = "force-dynamic";

export default async function Overview() {
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const [paid, failed, lowStock, logs, products] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: since }, status: { notIn: ["PENDING", "CANCELLED"] } } }),
    prisma.order.count({ where: { status: "FAILED" } }),
    prisma.variant.count({ where: { stock: { lt: 10 }, product: { active: true } } }),
    prisma.syncLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.product.count({ where: { active: true } }),
  ]);
  const revenue = paid.reduce((s, o) => s + o.subtotalCents, 0);
  const cost = paid.reduce((s, o) => s + o.costCents, 0);
  // Payment processing fees (Safepay percentage, or Stripe 2.9% + 30c), so profit is realistic.
  const fees = paid.reduce((s, o) => s + paymentFeeCents(o.subtotalCents, o.paymentProvider), 0);

  const stats = [
    ["Revenue, last 30 days", formatUsd(revenue)],
    ["Profit after supplier and payment fees", formatUsd(revenue - cost - fees)],
    ["Orders, last 30 days", String(paid.length)],
    ["Average order", paid.length ? formatUsd(Math.round(revenue / paid.length)) : "-"],
  ];

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold">Overview</h1>
        <form action={syncNow}><button className="btn-ghost">Sync suppliers now</button></form>
      </div>
      <p className="mt-2 text-sm text-ink/60">Profit here does not include ad spend. Track that separately: it is usually the biggest cost.</p>

      <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-meadow p-5"><dt className="text-sm">{k}</dt><dd className="mt-2 text-2xl font-bold">{v}</dd></div>
        ))}
      </dl>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Link href="/admin/orders?status=FAILED" className={`rounded-2xl p-5 ${failed ? "bg-biscuit" : "bg-meadow"}`}>
          <p className="text-2xl font-bold">{failed}</p><p className="text-sm">orders failed to reach the supplier</p>
        </Link>
        <Link href="/admin/products" className="rounded-2xl bg-meadow p-5">
          <p className="text-2xl font-bold">{lowStock}</p><p className="text-sm">options with fewer than 10 in stock</p>
        </Link>
        <Link href="/admin/products" className="rounded-2xl bg-meadow p-5">
          <p className="text-2xl font-bold">{products}</p><p className="text-sm">products live in the store</p>
        </Link>
      </div>

      <h2 className="mt-10 text-xl font-bold">Recent sync activity</h2>
      <ul className="mt-3 divide-y divide-ink/10 text-sm">
        {logs.length === 0 && <li className="py-3 text-ink/60">No syncs yet. They run every 6 hours, or press Sync suppliers now.</li>}
        {logs.map((l) => (
          <li key={l.id} className="flex gap-3 py-3">
            <span className={l.ok ? "text-moss" : "text-red-700"}>{l.ok ? "OK" : "Issue"}</span>
            <span className="w-20 shrink-0 text-ink/60">{l.kind}</span>
            <span className="flex-1">{l.message}</span>
            <time className="shrink-0 text-ink/50">{l.createdAt.toISOString().slice(0, 16).replace("T", " ")}</time>
          </li>
        ))}
      </ul>
    </div>
  );
}
