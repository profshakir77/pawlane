import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard } from "@/components/ProductCard";
import { GUIDES } from "@/content/guides";
import { prisma } from "@/lib/db";
import { JsonLd, breadcrumbLd, categorySlug, productLd } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({ where: { slug: params.slug }, include: { variants: { orderBy: { priceCents: "asc" } } } });
  if (!p) return {};
  const from = p.variants[0] ? ` From $${(p.variants[0].priceCents / 100).toFixed(2)}, free shipping.` : "";
  const description = p.seoDescription || `${p.description.slice(0, 150 - from.length).replace(/\s+\S*$/, "")}.${from}`;
  return {
    title: p.seoTitle || p.title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { type: "website", title: p.seoTitle || p.title, description, images: p.images.slice(0, 4) },
    robots: p.active ? undefined : { index: false },
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const p = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { variants: { orderBy: { priceCents: "asc" } } },
  });
  if (!p || !p.active) notFound();

  const related = await prisma.product.findMany({
    where: { active: true, category: p.category, NOT: { id: p.id } },
    include: { variants: { orderBy: { priceCents: "asc" }, take: 1 } },
    take: 3,
  });
  const guide = GUIDES.find((g) => g.category === p.category);
  const catPath = `/category/${categorySlug(p.category)}`;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <JsonLd data={productLd(p)} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: p.category, path: catPath }, { name: p.title, path: `/products/${p.slug}` }])} />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/60">
        <Link href="/">Home</Link> / <Link href={catPath}>{p.category}</Link> / <span aria-current="page">{p.title}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="grid gap-4">
          {p.images.slice(0, 4).map((src, i) => (
            <img key={src} src={src} alt={i === 0 ? p.title : `${p.title}, photo ${i + 1}`} loading={i === 0 ? "eager" : "lazy"}
              width={900} height={900} className="w-full rounded-[28px] bg-meadow object-cover" />
          ))}
        </div>
        <div className="md:sticky md:top-28 md:self-start">
          <Link href={catPath} className="text-moss hover:underline">{p.category}</Link>
          <h1 className="mt-1 text-4xl font-extrabold leading-tight">{p.title}</h1>
          <div className="mt-6">
            <AddToCart product={{ title: p.title, slug: p.slug, image: p.images[0] }}
              variants={p.variants.map((v) => ({ id: v.id, name: v.name, priceCents: v.priceCents, compareAtCents: v.compareAtCents, stock: v.stock, image: v.image }))} />
          </div>
          <h2 className="mt-10 text-xl font-bold">What it is</h2>
          <p className="mt-2 max-w-prose leading-relaxed text-ink/80">{p.description}</p>
          <ul className="mt-8 space-y-2 border-t border-ink/10 pt-6 text-sm">
            <li>Ships free with tracking. Usually 7 to 15 business days.</li>
            <li>30 days to return it. <Link href="/shipping-returns" className="underline">How returns work</Link></li>
            <li>Pay by card, Apple Pay or Google Pay.</li>
          </ul>
          {guide && (
            <Link href={`/guides/${guide.slug}`} className="mt-6 block rounded-2xl bg-meadow p-4 hover:bg-biscuit/40">
              <span className="text-sm text-moss">Buying guide</span><br /><span className="font-semibold">{guide.title}</span>
            </Link>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-2xl font-extrabold">More {p.category.toLowerCase()}</h2>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
            {related.map((r) => (
              <ProductCard key={r.id} p={{ slug: r.slug, title: r.title, image: r.images[0], category: r.category, fromCents: r.variants[0]?.priceCents ?? 0, compareAtCents: r.variants[0]?.compareAtCents }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
