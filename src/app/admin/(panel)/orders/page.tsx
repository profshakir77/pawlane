import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/currency";
import { paymentFeeCents, profitCents } from "@/lib/fees";
import { retryOrder } from "../../actions";

export const dynamic = "force-dynamic";
const STATUSES: OrderStatus[] = ["PAID", "SENT_TO_SUPPLIER", "SHIPPED", "DELIVERED", "FAILED", "PENDING", "CANCELLED"];

const LABEL: Record<OrderStatus, string> = {
  PENDING: "Not paid", PAID: "Paid", SENT_TO_SUPPLIER: "With supplier", SHIPPED: "Shipped",
  DELIVERED: "Delivered", CANCELLED: "Cancelled", FAILED: "Needs attention",
};
const BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-ink/10 text-ink/60", PAID: "bg-sky-100 text-sky-800", SENT_TO_SUPPLIER: "bg-amber-100 text-amber-800",
  SHIPPED: "bg-indigo-100 text-indigo-800", DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-ink/10 text-ink/50", FAILED: "bg-red-100 text-red-700",
};

type Addr = { name?: string; phone?: string; line1?: string; line2?: string; city?: string; state?: string; postalCode?: string; countryCode?: string };

export default async function Orders({ searchParams }: { searchParams: { status?: string } }) {
  const status = STATUSES.includes(searchParams.status as OrderStatus) ? (searchParams.status as OrderStatus) : undefined;
  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: status ? { status } : { status: { not: "PENDING" } },
      include: { items: true, fulfillments: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = (s: OrderStatus) => counts.find((c) => c.status === s)?._count ?? 0;
  const paidTotal = STATUSES.filter((s) => s !== "PENDING").reduce((n, s) => n + count(s), 0);
  const isTest = (o: { paymentProvider: string | null; name: string | null }) =>
    (o.paymentProvider === "safepay" && process.env.SAFEPAY_ENV !== "production") || /^test\b/i.test(o.name ?? "");

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Orders</h1>
      {count("FAILED") > 0 && !status && (
        <Link href="/admin/orders?status=FAILED" className="mt-4 block rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {count("FAILED")} order{count("FAILED") > 1 ? "s need" : " needs"} attention. Open them to see what went wrong.
        </Link>
      )}
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/orders" className={`rounded-full px-3 py-1 ${!status ? "bg-ink text-paper" : "bg-meadow"}`}>All orders ({paidTotal})</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`rounded-full px-3 py-1 ${status === s ? "bg-ink text-paper" : "bg-meadow"}`}>
            {LABEL[s]} ({count(s)})
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {orders.map((o) => {
          const a = (o.shippingAddress ?? {}) as Addr;
          const test = isTest(o);
          return (
            <article key={o.id} className="rounded-2xl border border-ink/10 p-5">
              <header className="flex flex-wrap items-center gap-3">
                <span className="text-lg font-bold">#{o.number}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE[o.status]}`}>{LABEL[o.status]}</span>
                {test && <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800">Test</span>}
                <span className="text-sm text-ink/50">{o.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC</span>
                <span className="ml-auto text-right text-sm"><b>{formatUsd(o.subtotalCents)}</b> <span className="text-ink/55">fee {formatUsd(paymentFeeCents(o.subtotalCents, o.paymentProvider))} &middot; profit {formatUsd(profitCents(o))}</span></span>
              </header>

              <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-ink/45">Customer</p>
                  <p className="mt-1">{o.name}</p>
                  <p className="text-ink/65">{o.email}</p>
                  <p className="text-ink/65">{o.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-ink/45">Ship to</p>
                  <p className="mt-1 text-ink/80">{[a.line1, a.line2].filter(Boolean).join(", ")}</p>
                  <p className="text-ink/80">{[a.city, a.state, a.postalCode].filter(Boolean).join(", ")} {a.countryCode}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-ink/45">Items</p>
                  {o.items.map((i) => <p key={i.id} className="mt-1">{i.quantity} &times; {i.title}</p>)}
                </div>
              </div>

              {(o.fulfillments.length > 0 || o.error) && (
                <div className="mt-4 border-t border-ink/10 pt-3 text-sm">
                  {o.fulfillments.map((f) => (
                    <p key={f.id}>Supplier {f.supplier.toUpperCase()}: order {f.supplierOrderId}
                      {f.trackingNumber && <> &middot; tracking <a href={f.trackingUrl ?? "#"} className="underline" target="_blank" rel="noreferrer">{f.trackingNumber}</a></>}
                    </p>
                  ))}
                  {o.error && <p className="mt-1 rounded-lg bg-red-50 p-2 text-xs text-red-700">{o.error}</p>}
                </div>
              )}

              {(o.status === "PAID" || o.status === "FAILED") && !test && (
                <form action={retryOrder.bind(null, o.id)} className="mt-3">
                  <button className="rounded-full bg-ink px-4 py-1.5 text-xs text-paper">Send to supplier</button>
                </form>
              )}
            </article>
          );
        })}
      </div>
      {orders.length === 0 && <p className="mt-6 text-ink/60">No orders here yet.</p>}
    </div>
  );
}
