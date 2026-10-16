import type { MetadataRoute } from "next";
import { GUIDES } from "@/content/guides";
import { prisma } from "@/lib/db";
import { abs, categorySlug } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({ where: { active: true }, select: { slug: true, updatedAt: true, category: true } });
  const categories = [...new Set(products.map((p) => p.category))];
  return [
    { url: abs("/"), changeFrequency: "daily", priority: 1 },
    { url: abs("/guides"), changeFrequency: "weekly", priority: 0.6 },
    ...["/about", "/shipping-returns", "/contact", "/privacy", "/terms", "/ownership"].map((path) => ({ url: abs(path), changeFrequency: "yearly" as const, priority: 0.3 })),
    ...categories.map((c) => ({ url: abs(`/category/${categorySlug(c)}`), changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: abs(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "daily" as const, priority: 0.7 })),
    ...GUIDES.map((g) => ({ url: abs(`/guides/${g.slug}`), lastModified: new Date(g.date), changeFrequency: "monthly" as const, priority: 0.5 })),
  ];
}
