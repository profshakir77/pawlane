import Link from "next/link";
import { ProductCard, toCard } from "@/components/ProductCard";
import { TrustBar } from "@/components/TrustBar";
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
  const categories = [...new Set<string>(all.map((p) => p.category))].sort();
  const hero = all.find((p) => p.images[0]);
  const heroAlt = all.find((p) => p.images[0] && p.id !== hero?.id);
  const catTiles = categories.map((c) => ({ name: c, image: all.find((p) => p.category === c && p.images[0])?.images[0], count: all.filter((p) => p.category === c).length }));

  return (
    <>
      <JsonLd data={orgLd()} />

      {/* Hero */}
      <section className="container-x grid items-center gap-8 pb-16 pt-5 sm:gap-10 sm:pt-14 lg:grid-cols-12 lg:gap-16 lg:pb-24">
        <div className="animate-fade-up lg:col-span-6">
          <p className="eyebrow">Considered essentials for dogs &amp; cats</p>
          <h1 className="mt-4 text-[40px] leading-[1.02] sm:mt-5 sm:text-6xl lg:text-[76px]">
            Better days for them. <em className="text-moss">Calmer</em> ones for you.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-ink/70 sm:text-lg">
            The dog who inhales dinner. The cat who ignores her water bowl. The walk that ends with a sore shoulder. Each piece here quietly fixes one of those.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="#shop" className="btn-primary">Shop the collection</Link>
            <Link href="/guides" className="btn-ghost">Read the guides</Link>
          </div>
          <dl className="mt-12 flex gap-10 border-t border-line pt-6 text-sm">
            <div><dt className="text-ink/55">Shipping</dt><dd className="mt-1 font-medium">Free, tracked</dd></div>
            <div><dt className="text-ink/55">Returns</dt><dd className="mt-1 font-medium">30 days</dd></div>
            <div><dt className="text-ink/55">Ships to</dt><dd className="mt-1 font-medium">40+ countries</dd></div>
          </dl>
        </div>
        <div className="relative order-first lg:order-none lg:col-span-6">
          <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-meadow sm:aspect-[16/10] lg:aspect-[4/5]">
            {hero && <img src={hero.images[0]} alt={hero.title} className="h-full w-full object-cover" fetchPriority="high" />}
            {hero && (
              <Link href={`/products/${hero.slug}`} className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 rounded-lg bg-paper/95 p-4 shadow-soft backdrop-blur transition hover:bg-paper sm:right-auto sm:min-w-[300px]">
                <span>
                  <span className="eyebrow">Featured</span>
                  <span className="mt-1 block font-display text-lg leading-tight">{hero.title}</span>
                </span>
                <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink text-paper">&rarr;</span>
              </Link>
            )}
          </div>
          {heroAlt && (
            <div className="absolute -left-8 top-10 hidden w-40 overflow-hidden rounded-lg border-4 border-paper shadow-soft xl:block">
              <img src={heroAlt.images[0]} alt="" aria-hidden className="aspect-square w-full object-cover" />
            </div>
          )}
        </div>
      </section>

      <TrustBar />

      {/* Shop by category */}
      {catTiles.length > 1 && (
        <section className="container-x mt-24">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Explore</p>
              <h2 className="mt-3 text-4xl sm:text-5xl">Shop by need</h2>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {catTiles.map((c) => (
              <Link key={c.name} href={`/category/${categorySlug(c.name)}`} className="group relative aspect-[3/4] overflow-hidden rounded-lg bg-meadow">
                {c.image && <img src={c.image} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
                <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <span className="absolute bottom-4 left-4 text-paper">
                  <span className="block font-display text-2xl">{c.name}</span>
                  <span className="text-xs text-paper/75">{c.count} {c.count === 1 ? "piece" : "pieces"}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section id="shop" className="container-x mt-24 scroll-mt-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Everything we carry</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-paper">All</span>
            {categories.map((c) => (
              <Link key={c} href={`/category/${categorySlug(c)}`} className="rounded-full border border-line px-4 py-2 text-xs font-medium transition hover:border-ink">{c}</Link>
            ))}
          </div>
        </div>
        {all.length === 0 ? (
          <p className="mt-10 rounded-lg bg-meadow p-12 text-center text-ink/70">New pieces are on their way. Check back in a day or two.</p>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
            {all.map((p) => <ProductCard key={p.id} p={toCard(p)} />)}
          </div>
        )}
      </section>

      {/* Editorial band */}
      <section className="mt-28 bg-meadow">
        <div className="container-x grid gap-12 py-20 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <div>
            <p className="eyebrow">Our approach</p>
            <h2 className="mt-4 text-4xl leading-tight sm:text-5xl">Fewer things. <em>Better</em> chosen.</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2">
            {[
              ["Solves a real problem", "If it doesn't fix something owners actually complain about, we don't stock it."],
              ["Priced honestly", "No inflated retail tags. Shipping is already included in the price you see."],
              ["Tested at home", "We look for materials that survive chewing, washing and everyday mess."],
              ["Easy to send back", "Thirty days, no awkward questions. We'd rather you kept only what works."],
            ].map(([t, d], i) => (
              <div key={t}>
                <p className="font-display text-sm text-biscuit">0{i + 1}</p>
                <h3 className="mt-2 text-xl">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides */}
      <section className="container-x mt-24">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">The journal</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Before you buy</h2>
          </div>
          <Link href="/guides" className="hidden border-b border-ink pb-0.5 text-sm font-medium sm:block">All guides</Link>
        </div>
        <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
          {GUIDES.slice(0, 4).map((g) => (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="group flex flex-col justify-between gap-8 bg-paper p-8 transition hover:bg-meadow">
              <div>
                <p className="eyebrow">{g.category ?? "Guide"}</p>
                <h3 className="mt-3 text-2xl leading-snug">{g.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink/65">{g.description}</p>
              </div>
              <span className="text-sm font-medium">Read guide <span className="inline-block transition-transform group-hover:translate-x-1">&rarr;</span></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
