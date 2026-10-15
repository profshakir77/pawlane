import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard, toCard } from "@/components/ProductCard";
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
    <div className="container-x pt-6">
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: data.category, path }])} />
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "ItemList",
        itemListElement: data.products.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/products/${p.slug}`) })),
      }} />
      <nav aria-label="Breadcrumb" className="text-xs text-ink/55"><Link href="/" className="hover:text-ink">Home</Link><span className="mx-2">/</span><span className="text-ink">{data.category}</span></nav>
      <header className="border-b border-line pb-12 pt-10 text-center">
        <p className="eyebrow">{data.products.length} {data.products.length === 1 ? "piece" : "pieces"}</p>
        <h1 className="mx-auto mt-4 max-w-3xl text-5xl leading-[1.05] sm:text-6xl">{copy.title}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink/70 sm:text-lg">{copy.intro}</p>
      </header>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4">
        {data.products.map((p) => <ProductCard key={p.id} p={toCard(p)} />)}
      </div>
    </div>
  );
}
