import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { prisma } from "@/lib/db";
import { JsonLd, abs, breadcrumbLd, categoryCopy, categorySlug } from "@/lib/seo";

export const revalidate = 300;

async function load(slug: string) {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { variants: { orderBy: { priceCents: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  const inCat = products.filter((p) => categorySlug(p.category) === slug);
  return inCat.length ? { category: inCat[0].category, products: inCat } : null;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await load(params.slug);
  if (!data) return {};
  const copy = categoryCopy(data.category);
  return {
    title: copy.title,
    description: copy.intro.slice(0, 155),
    alternates: { canonical: `/category/${params.slug}` },
    openGraph: { title: copy.title, images: data.products[0]?.images.slice(0, 1) },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const data = await load(params.slug);
  if (!data) notFound();
  const copy = categoryCopy(data.category);
  const path = `/category/${params.slug}`;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: data.category, path }])} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "ItemList",
        itemListElement: data.products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/products/${p.slug}`) })),
      }} />
      <nav aria-label="Breadcrumb" className="text-sm text-ink/60"><Link href="/">Home</Link> / {data.category}</nav>
      <h1 className="mt-2 text-5xl font-extrabold">{copy.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/75">{copy.intro}</p>
      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
        {data.products.map((p) => (
          <ProductCard key={p.id} p={{ slug: p.slug, title: p.title, image: p.images[0], category: p.category, fromCents: p.variants[0]?.priceCents ?? 0, compareAtCents: p.variants[0]?.compareAtCents }} />
        ))}
      </div>
    </div>
  );
}
