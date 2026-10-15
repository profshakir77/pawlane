import { prisma } from "@/lib/db";
import { STORE_NAME, abs } from "@/lib/seo";

// Google Merchant Center feed. Submit https://yourdomain.com/feed.xml in
// Merchant Center to appear in free Shopping listings worldwide.
export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const products = await prisma.product.findMany({ where: { active: true }, include: { variants: true } });
  const items = products.flatMap((p) =>
    p.variants.map((v) => `
    <item>
      <g:id>${esc(v.id)}</g:id>
      <g:item_group_id>${esc(p.id)}</g:item_group_id>
      <g:title>${esc(p.variants.length > 1 ? `${p.title} - ${v.name}` : p.title)}</g:title>
      <g:description>${esc(p.description.slice(0, 4900))}</g:description>
      <g:link>${abs(`/products/${p.slug}`)}</g:link>
      <g:image_link>${esc(v.image || p.images[0] || "")}</g:image_link>
      ${p.images.slice(1, 6).map((i) => `<g:additional_image_link>${esc(i)}</g:additional_image_link>`).join("")}
      <g:availability>${v.stock > 0 ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${(v.priceCents / 100).toFixed(2)} USD</g:price>
      <g:brand>${esc(STORE_NAME)}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(p.category)}</g:product_type>
      <g:shipping><g:price>0.00 USD</g:price></g:shipping>
    </item>`),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(STORE_NAME)}</title>
    <link>${abs("/")}</link>
    <description>${esc(STORE_NAME)} product feed</description>${items.join("")}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
