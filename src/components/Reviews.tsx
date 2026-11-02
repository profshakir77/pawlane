import { prisma } from "@/lib/db";
import { submitReview } from "@/lib/reviews";

const stars = (n: number) => "★★★★★".slice(0, n) + "☆☆☆☆☆".slice(0, 5 - n);

export async function Reviews({ productId, slug }: { productId: string; slug: string }) {
  const reviews = await prisma.review.findMany({ where: { productId, approved: true }, orderBy: { createdAt: "desc" }, take: 50 });
  const avg = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;

  return (
    <section id="reviews" className="container-x mt-24">
      <p className="eyebrow">Customer reviews</p>
      <h2 className="mt-3 text-4xl">What owners say</h2>
      {reviews.length > 0 ? (
        <>
          <p className="mt-4 text-sm text-ink/70"><span className="text-amber-500">{stars(Math.round(avg))}</span> {avg.toFixed(1)} out of 5 from {reviews.length} review{reviews.length > 1 ? "s" : ""}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <article key={r.id} className="rounded-lg border border-line p-5">
                <p className="text-amber-500">{stars(r.rating)}</p>
                <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-ink/80">{r.body}</p>
                <p className="mt-3 text-xs text-ink/55">{r.name} &middot; {r.createdAt.toISOString().slice(0, 10)}</p>
              </article>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-sm text-ink/65">No reviews yet. Bought this for your pet? Tell other owners how it went.</p>
      )}

      <details className="mt-8 max-w-xl rounded-lg border border-line p-5">
        <summary className="cursor-pointer text-sm font-semibold">Write a review</summary>
        <form action={submitReview.bind(null, productId, slug)} className="mt-4 grid gap-3 text-sm">
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <label className="grid gap-1">Rating
            <select name="rating" defaultValue="5" className="rounded-md border border-line p-2">
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{stars(n)} ({n})</option>)}
            </select>
          </label>
          <label className="grid gap-1">Your name<input name="name" required maxLength={60} className="rounded-md border border-line p-2" /></label>
          <label className="grid gap-1">Email (not shown)<input name="email" type="email" maxLength={120} className="rounded-md border border-line p-2" /></label>
          <label className="grid gap-1">Your review<textarea name="body" required minLength={10} maxLength={1500} rows={4} className="rounded-md border border-line p-2" /></label>
          <button className="justify-self-start rounded-full bg-ink px-5 py-2 text-paper">Submit review</button>
          <p className="text-xs text-ink/55">Reviews appear after a quick check.</p>
        </form>
      </details>
    </section>
  );
}
