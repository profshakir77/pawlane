import { prisma } from "./db";
import { compareAtPrice, retailPrice } from "./pricing";
import { cleanTitle } from "./seo";
import { slugify } from "./slug";
import { getSupplier } from "./suppliers";

// Pull a product from a supplier into the store, priced by your markup rules.
export async function importProduct(supplier: string, supplierProductId: string, category?: string) {
  const sp = await getSupplier(supplier).getProduct(supplierProductId);
  if (!sp) throw new Error("Supplier product not found");
  if (!sp.variants.length) throw new Error("Supplier product has no variants");

  // Use stock from the product details when the supplier sends it (one call);
  // otherwise ask per variant.
  const known = sp.variants.every((v) => typeof v.stock === "number");
  const stock: Record<string, number> = known
    ? {}
    : await getSupplier(supplier).getStock(sp.variants.map((v) => v.supplierVariantId));
  const variants = sp.variants.map((v) => {
    const price = retailPrice(v.costCents);
    return {
      name: v.name,
      sku: v.sku,
      supplierVariantId: v.supplierVariantId,
      costCents: v.costCents,
      priceCents: price,
      compareAtCents: compareAtPrice(price),
      stock: stock[v.supplierVariantId] ?? v.stock ?? 0,
      image: v.image,
    };
  });

  return prisma.product.upsert({
    where: { supplier_supplierProductId: { supplier, supplierProductId } },
    update: {},
    create: {
      slug: slugify(cleanTitle(sp.title), sp.supplierProductId),
      title: cleanTitle(sp.title),
      description: sp.description,
      images: sp.images,
      category: category || sp.category,
      supplier,
      supplierProductId,
      lastSyncedAt: new Date(),
      variants: { create: variants },
    },
  });
}
