import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatUsd } from "@/lib/currency";
import { marginPct } from "@/lib/pricing";
import { setSeo, setVariantPrice, toggleActive, unlockPrices } from "../../actions";

export const dynamic = "force-dynamic";

export default async function Products() {
  const products = await prisma.product.findMany({ include: { variants: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Products</h1>
        <Link href="/admin/import" className="btn-primary">Find products</Link>
      </div>
      <p className="mt-2 text-sm text-ink/60">Prices follow your markup rule and update with supplier costs. Editing a price locks that product so syncs stop changing it.</p>

      <div className="mt-6 space-y-6">
        {products.map((p) => (
          <section key={p.id} className={`rounded-3xl border border-ink/10 p-5 ${p.active ? "" : "opacity-60"}`}>
            <div className="flex flex-wrap items-start gap-4">
              {p.images[0] && <img src={p.images[0]} alt="" className="h-16 w-16 rounded-xl object-cover" />}
              <div className="flex-1">
                <Link href={`/products/${p.slug}`} className="font-bold hover:underline">{p.title}</Link>
                <p className="text-sm text-ink/60">{p.category} . {p.supplier} {p.supplierProductId} . synced {p.lastSyncedAt?.toISOString().slice(0, 16).replace("T", " ") ?? "never"}</p>
              </div>
              {p.priceLocked && <form action={unlockPrices.bind(null, p.id)}><button className="btn-ghost px-3 py-1 text-sm">Use markup rule again</button></form>}
              <form action={toggleActive.bind(null, p.id)}><button className="btn-ghost px-3 py-1 text-sm">{p.active ? "Hide from store" : "Show in store"}</button></form>
            </div>
            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-ink/60"><tr><th className="py-1">Option</th><th>Cost</th><th>Price</th><th>Margin</th><th>Stock</th></tr></thead>
              <tbody>
                {p.variants.map((v) => (
                  <tr key={v.id} className="border-t border-ink/10">
                    <td className="py-2">{v.name}</td>
                    <td>{formatUsd(v.costCents)}</td>
                    <td>
                      <form action={setVariantPrice} className="flex items-center gap-2">
                        <input type="hidden" name="variantId" value={v.id} />
                        <label className="sr-only" htmlFor={`p-${v.id}`}>Price in USD</label>
                        <input id={`p-${v.id}`} name="price" defaultValue={(v.priceCents / 100).toFixed(2)} className="w-24 rounded-lg border border-ink/20 px-2 py-1" />
                        <button className="text-xs underline">Save</button>
                      </form>
                    </td>
                    <td className={marginPct(v.priceCents, v.costCents) < 40 ? "text-red-700" : ""}>{marginPct(v.priceCents, v.costCents)}%</td>
                    <td className={v.stock < 10 ? "font-semibold text-red-700" : ""}>{v.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <details className="mt-4 border-t border-ink/10 pt-3">
              <summary className="cursor-pointer text-sm font-semibold">Edit title, description and search snippet</summary>
              <form action={setSeo} className="mt-3 grid gap-3 text-sm">
                <input type="hidden" name="productId" value={p.id} />
                <label>Product name<input name="title" defaultValue={p.title} className="input mt-1" /></label>
                <label>Search title (Google shows about 60 characters)<input name="seoTitle" defaultValue={p.seoTitle ?? ""} maxLength={70} placeholder={p.title} className="input mt-1" /></label>
                <label>Search description (about 155 characters)<textarea name="seoDescription" defaultValue={p.seoDescription ?? ""} maxLength={170} rows={2} className="input mt-1" /></label>
                <label>Product description (rewrite in your own words; copied supplier text ranks poorly)<textarea name="description" defaultValue={p.description} rows={5} className="input mt-1" /></label>
                <button className="btn-primary w-fit px-4 py-2">Save text</button>
              </form>
            </details>
          </section>
        ))}
        {products.length === 0 && <p className="text-ink/60">No products yet. Use Find products to import your first one.</p>}
      </div>
    </div>
  );
}
