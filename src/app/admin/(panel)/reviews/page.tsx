import { prisma } from "@/lib/db";
import { approveReview, deleteReview } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function ReviewsAdmin() {
  const reviews = await prisma.review.findMany({ include: { product: true }, orderBy: [{ approved: "asc" }, { createdAt: "desc" }], take: 200 });
  return (
    <div>
      <h1 className="text-3xl font-extrabold">Reviews</h1>
      <p className="mt-2 text-sm text-ink/60">New reviews stay hidden until you approve them.</p>
      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <article key={r.id} className="rounded-2xl border border-ink/10 p-5 text-sm">
            <header className="flex flex-wrap items-center gap-3">
              <b>{r.product.title}</b>
              <span className="text-amber-500">{"★".repeat(r.rating)}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.approved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{r.approved ? "Live" : "Waiting"}</span>
              <span className="text-ink/50">{r.name}{r.email ? ` (${r.email})` : ""} &middot; {r.createdAt.toISOString().slice(0, 10)}</span>
            </header>
            <p className="mt-3 whitespace-pre-line text-ink/80">{r.body}</p>
            <div className="mt-3 flex gap-2">
              {!r.approved && <form action={approveReview.bind(null, r.id)}><button className="rounded-full bg-ink px-4 py-1.5 text-xs text-paper">Approve</button></form>}
              <form action={deleteReview.bind(null, r.id)}><button className="rounded-full border border-red-300 px-4 py-1.5 text-xs text-red-700">Delete</button></form>
            </div>
          </article>
        ))}
      </div>
      {reviews.length === 0 && <p className="mt-6 text-ink/60">No reviews yet.</p>}
    </div>
  );
}
