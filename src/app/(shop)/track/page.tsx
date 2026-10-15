import { prisma } from "@/lib/db";

const LABEL: Record<string, string> = {
  PENDING: "Waiting for payment", PAID: "Payment received, preparing your order", SENT_TO_SUPPLIER: "Being packed",
  SHIPPED: "On its way", DELIVERED: "Delivered", CANCELLED: "Cancelled", FAILED: "Being prepared",
};

export const dynamic = "force-dynamic";
export const metadata = { title: "Track your order", robots: { index: false } };

export default async function Track({ searchParams }: { searchParams: { order?: string; email?: string } }) {
  const num = Number(String(searchParams.order ?? "").replace(/\D/g, ""));
  const email = searchParams.email?.trim().toLowerCase();
  const order = num && email
    ? await prisma.order.findFirst({ where: { number: num, email: { equals: email, mode: "insensitive" } }, include: { fulfillments: true, items: true } })
    : null;

  return (
    <div className="mx-auto max-w-xl px-5 py-16">
      <h1 className="text-4xl">Track your order</h1>
      <form className="mt-8 space-y-3">
        <input name="order" className="input" placeholder="Order number, e.g. 1042" defaultValue={searchParams.order} required />
        <input name="email" type="email" className="input" placeholder="Email used at checkout" defaultValue={searchParams.email} required />
        <button className="btn-primary w-full">Find order</button>
      </form>

      {num && email && !order && (
        <p role="alert" className="mt-6 rounded-xl bg-biscuit/30 p-4">No order matches that number and email. Check your receipt email for the exact number.</p>
      )}
      {order && (
        <div className="mt-8 rounded-lg bg-meadow p-6">
          <p className="text-sm text-moss">Order #{order.number}</p>
          <p className="text-2xl font-bold">{LABEL[order.status]}</p>
          <ul className="mt-4 text-sm">{order.items.map((i) => <li key={i.id}>{i.quantity} x {i.title}</li>)}</ul>
          {order.fulfillments.filter((f) => f.trackingNumber).map((f) => (
            <p key={f.id} className="mt-4">
              {f.carrier ?? "Carrier"}: <a className="font-semibold underline" href={f.trackingUrl ?? "#"} target="_blank" rel="noreferrer">{f.trackingNumber}</a>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
