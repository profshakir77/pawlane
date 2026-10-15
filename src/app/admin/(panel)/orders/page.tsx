import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/currency";
import { retryOrder } from "../../actions";

export const dynamic = "force-dynamic";
const STATUSES: OrderStatus[] = ["PAID", "SENT_TO_SUPPLIER", "SHIPPED", "DELIVERED", "FAILED", "PENDING", "CANCELLED"];

export default async function Orders({ searchParams }: { searchParams: { status?: string } }) {
  const status = STATUSES.includes(searchParams.status as OrderStatus) ? (searchParams.status as OrderStatus) : undefined;
  const orders = await prisma.order.findMany({
    where: status ? { status } : { status: { not: "PENDING" } },
    include: { items: true, fulfillments: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-3xl font-extrabold">Orders</h1>
      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/orders" className={`rounded-full px-3 py-1 ${!status ? "bg-ink text-paper" : "bg-meadow"}`}>All paid</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={`rounded-full px-3 py-1 ${status === s ? "bg-ink text-paper" : "bg-meadow"}`}>{s.replace(/_/g, " ").toLowerCase()}</Link>
        ))}
      </div>

      <table className="mt-6 w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-ink"><tr>
          <th className="py-2">Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Profit</th><th>Status</th><th>Supplier / tracking</th>
        </tr></thead>
        <tbody className="divide-y divide-ink/10">
          {orders.map((o) => {
            const addr = o.shippingAddress as { city?: string; countryCode?: string } | null;
            return (
              <tr key={o.id} className="align-top">
                <td className="py-3 font-semibold">#{o.number}<br /><span className="font-normal text-ink/50">{o.createdAt.toISOString().slice(0, 10)}</span></td>
                <td>{o.name}<br /><span className="text-ink/60">{o.email}</span><br /><span className="text-ink/60">{addr?.city} {addr?.countryCode}</span></td>
                <td>{o.items.map((i) => <div key={i.id}>{i.quantity} x {i.title}</div>)}</td>
                <td>{formatUsd(o.subtotalCents)}</td>
                <td>{formatUsd(o.subtotalCents - o.costCents)}</td>
                <td>
                  <span className={o.status === "FAILED" ? "font-semibold text-red-700" : ""}>{o.status.replace(/_/g, " ").toLowerCase()}</span>
                  {o.error && <p className="mt-1 max-w-[220px] text-xs text-red-700">{o.error}</p>}
                  {(o.status === "PAID" || o.status === "FAILED") && (
                    <form action={retryOrder.bind(null, o.id)}><button className="mt-2 rounded-full bg-ink px-3 py-1 text-xs text-paper">Send to supplier</button></form>
                  )}
                </td>
                <td>{o.fulfillments.map((f) => (
                  <div key={f.id}>{f.supplier}: {f.supplierOrderId}
                    {f.trackingNumber && <><br /><a href={f.trackingUrl ?? "#"} className="underline" target="_blank" rel="noreferrer">{f.trackingNumber}</a></>}
                  </div>
                ))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {orders.length === 0 && <p className="mt-6 text-ink/60">No orders here yet.</p>}
    </div>
  );
}
