import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { ProductCard, toCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { TrustBar } from "@/components/TrustBar";
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

  let related = await prisma.product.findMany({
    where: { active: true, category: p.category, NOT: { id: p.id } },
    include: { variants: { orderBy: { priceCents: "asc" } } },
    take: 4,
  });
  if (related.length < 4) {
    const more = await prisma.product.findMany({
      where: { active: true, NOT: { id: { in: [p.id, ...related.map((r) => r.id)] } } },
      include: { variants: { orderBy: { priceCents: "asc" } } },
      take: 4 - related.length,
    });
    related = [...related, ...more];
  }
  const guide = GUIDES.find((g) => g.category === p.category);
  const catPath = `/category/${categorySlug(p.category)}`;

  const details = [
    { t: "Shipping", d: "Free tracked shipping to 40+ countries. Most parcels arrive in 7 to 15 business days. You'll get a tracking link by email." },
    { t: "Returns", d: "If it doesn't suit your pet, you have 30 days from delivery to send it back for a refund.", link: { href: "/shipping-returns", label: "How returns work" } },
    { t: "Payment", d: "Pay securely by card, Apple Pay or Google Pay. Your card details never touch our servers." },
  ];

  return (
    <>
      <div className="container-x pb-16 pt-6">
        <JsonLd data={productLd(p)} />
        <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: p.category, path: catPath }, { name: p.title, path: `/products/${p.slug}` }])} />
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-ink/55">
          <Link href="/" className="hover:text-ink">Home</Link><span className="mx-2">/</span>
          <Link href={catPath} className="hover:text-ink">{p.category}</Link><span className="mx-2">/</span>
          <span aria-current="page" className="text-ink">{p.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery images={p.images} title={p.title} />
          </div>
          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
            <Link href={catPath} className="eyebrow hover:text-ink">{p.category}</Link>
            <h1 className="mt-3 text-4xl leading-[1.1] sm:text-5xl">{p.title}</h1>
            <div className="mt-6">
              <AddToCart product={{ title: p.title, slug: p.slug, image: p.images[0] }}
                variants={p.variants.map((v) => ({ id: v.id, name: v.name, priceCents: v.priceCents, compareAtCents: v.compareAtCents, stock: v.stock, image: v.image }))} />
            </div>

            <ul className="mt-8 grid grid-cols-3 gap-2 text-center text-[11px] leading-tight text-ink/70">
              <li className="rounded-md bg-meadow px-2 py-3"><span className="block font-semibold text-ink">Free</span>shipping</li>
              <li className="rounded-md bg-meadow px-2 py-3"><span className="block font-semibold text-ink">30-day</span>returns</li>
              <li className="rounded-md bg-meadow px-2 py-3"><span className="block font-semibold text-ink">Secure</span>checkout</li>
            </ul>

            <div className="mt-10 border-t border-line">
              <details open className="group border-b border-line py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                  Description <span className="text-xl font-light transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink/75">{p.description}</p>
              </details>
              {details.map((d) => (
                <details key={d.t} className="group border-b border-line py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
                    {d.t} <span className="text-xl font-light transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-4 text-[15px] leading-relaxed text-ink/75">
                    {d.d} {d.link && <Link href={d.link.href} className="underline underline-offset-2">{d.link.label}</Link>}
                  </p>
                </details>
              ))}
            </div>

            {guide && (
              <Link href={`/guides/${guide.slug}`} className="group mt-8 flex items-center justify-between gap-4 rounded-lg border border-line p-5 transition hover:border-ink">
                <span>
                  <span className="eyebrow">Buying guide</span>
                  <span className="mt-1.5 block font-display text-lg leading-snug">{guide.title}</span>
                </span>
                <span aria-hidden className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <TrustBar />

      {related.length > 0 && (
        <section className="container-x mt-24">
          <p className="eyebrow">You may also like</p>
          <h2 className="mt-3 text-4xl">Pairs well with</h2>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={toCard(r)} />)}
          </div>
        </section>
      )}
    </>
  );
}
