"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/db";
import { forwardOrder } from "@/lib/fulfillment";
import { runAllSyncs } from "@/lib/sync";

export async function toggleActive(id: string) {
  await requireAdmin();
  const p = await prisma.product.findUniqueOrThrow({ where: { id } });
  await prisma.product.update({ where: { id }, data: { active: !p.active } });
  revalidatePath("/admin/products"); revalidatePath("/");
}

export async function setVariantPrice(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("variantId"));
  const cents = Math.round(parseFloat(String(formData.get("price"))) * 100);
  if (!Number.isFinite(cents) || cents <= 0) return;
  const v = await prisma.variant.update({ where: { id }, data: { priceCents: cents } });
  await prisma.product.update({ where: { id: v.productId }, data: { priceLocked: true } });
  revalidatePath("/admin/products");
}

export async function unlockPrices(id: string) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { priceLocked: false } });
  revalidatePath("/admin/products");
}

export async function retryOrder(id: string) {
  await requireAdmin();
  await forwardOrder(id);
  revalidatePath("/admin/orders"); revalidatePath("/admin");
}

export async function deleteOrder(id: string) {
  await requireAdmin();
  const o = await prisma.order.findUniqueOrThrow({ where: { id }, include: { fulfillments: true } });
  // Never delete an order a supplier is already working on.
  if (o.fulfillments.length > 0 || ["SENT_TO_SUPPLIER", "SHIPPED", "DELIVERED"].includes(o.status)) {
    throw new Error("This order already reached the supplier and cannot be deleted.");
  }
  await prisma.order.delete({ where: { id } });
  revalidatePath("/admin/orders"); revalidatePath("/admin");
}

export async function syncNow() {
  await requireAdmin();
  await runAllSyncs();
  revalidatePath("/admin", "layout");
}

export async function setSeo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("productId"));
  const clean = (k: string) => String(formData.get(k) ?? "").trim() || null;
  const rawSlug = clean("slug");
  const slug = rawSlug ? rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") : undefined;
  if (slug) {
    const taken = await prisma.product.findFirst({ where: { slug, NOT: { id } }, select: { id: true } });
    if (taken) throw new Error(`The URL "${slug}" is already used by another product.`);
  }
  await prisma.product.update({
    where: { id },
    data: { slug: slug || undefined, title: clean("title") ?? undefined, seoTitle: clean("seoTitle"), seoDescription: clean("seoDescription"), description: clean("description") ?? undefined },
  });
  revalidatePath("/admin/products"); revalidatePath("/", "layout");
}
