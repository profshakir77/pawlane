import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES } from "@/content/guides";
import { prisma } from "@/lib/db";
import { JsonLd, STORE_NAME, abs, breadcrumbLd, categorySlug } from "@/lib/seo";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const g = GUIDES.find((x) => x.slug === params.slug);
  return g ? { title: g.title, description: g.description, alternates: { canonical: `/guides/${g.slug}` }, openGraph: { type: "article", title: g.title, description: g.description } } : {};
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const g = GUIDES.find((x) => x.slug === params.slug);
  if (!g) notFound();
  const products = await prisma.product.findMany({ where: { active: true, category: g.category }, take: 3 });

  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Article", headline: g.title, description: g.description,
        datePublished: g.date, dateModified: g.date, mainEntityOfPage: abs(`/guides/${g.slug}`),
        author: { "@type": "Organization", name: STORE_NAME }, publisher: { "@type": "Organization", name: STORE_NAME },
      }} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Guides", path: "/guides" }, { name: g.title, path: `/guides/${g.slug}` }])} />
      <nav aria-label="Breadcrumb" className="text-sm text-ink/60"><Link href="/">Home</Link> / <Link href="/guides">Guides</Link></nav>
      <h1 className="mt-2 text-4xl font-extrabold leading-tight sm:text-5xl">{g.title}</h1>
      <div className="mt-8 space-y-5 text-lg leading-relaxed">
        {g.blocks.map((b, i) => b.h2 ? <h2 key={i} className="pt-4 text-2xl font-bold">{b.h2}</h2> : <p key={i}>{b.p}</p>)}
      </div>
      {products.length > 0 && (
        <aside className="mt-12 rounded-3xl bg-meadow p-6">
          <h2 className="text-xl font-bold">Products mentioned</h2>
          <ul className="mt-3 space-y-2">
            {products.map((p) => <li key={p.id}><Link href={`/products/${p.slug}`} className="underline">{p.title}</Link></li>)}
          </ul>
          <Link href={`/category/${categorySlug(g.category)}`} className="mt-4 inline-block font-semibold">See all {g.category.toLowerCase()}</Link>
        </aside>
      )}
    </article>
  );
}
