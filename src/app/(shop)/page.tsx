import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/db";
import { GUIDES } from "@/content/guides";
import { JsonLd, categorySlug, orgLd } from "@/lib/seo";

export const revalidate = 300;

export default async function Home() {
  const all = await prisma.product.findMany({
    where: { active: true },
    include: { variants: { orderBy: { priceCents: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  const categories = [...new Set(all.map((p) => p.category))].sort();
  const products = all;

  return (
    <>
      <JsonLd data={orgLd()} />
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20">
        <h1 className="max-w-3xl text-5xl font-extrabold leading-[0.95] sm:text-7xl">
          Small fixes for the annoying parts of living with a dog or cat.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink/75">
          The dog who inhales dinner. The cat who won't touch her water bowl. The walk that ends with a sore
          shoulder. Each thing here is for one of those. Shipping is free and tracked, and if it doesn't suit
          your animal, you've got 30 days to send it back.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="#shop" className="btn-primary">See what we sell</Link>
          <Link href="/track" className="btn-ghost">Track an order</Link>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-6xl scroll-mt-24 px-5">
        <div className="mb-8 flex flex-wrap gap-2">
          <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper">All</span>
          {categories.map((c) => (
            <Link key={c} href={`/category/${categorySlug(c)}`} className="rounded-full bg-meadow px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-paper">{c}</Link>
          ))}
        </div>
        {products.length === 0 ? (
          <p className="rounded-3xl bg-meadow p-10 text-center">Nothing here yet. Check back in a day or two.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} p={{
                slug: p.slug, title: p.title, image: p.images[0], category: p.category,
                fromCents: p.variants[0]?.priceCents ?? 0, compareAtCents: p.variants[0]?.compareAtCents,
              }} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-5">
        <h2 className="text-3xl font-extrabold">Before you buy</h2>
        <p className="mt-2 max-w-xl text-ink/70">Short answers to the questions people email us most.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {GUIDES.slice(0, 4).map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="rounded-3xl bg-meadow p-6 hover:bg-biscuit/40">
              <h3 className="text-xl font-bold">{g.title}</h3>
              <p className="mt-2 text-ink/70">{g.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
