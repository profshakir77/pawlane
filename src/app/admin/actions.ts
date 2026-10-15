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

export async function syncNow() {
  await requireAdmin();
  await runAllSyncs();
  revalidatePath("/admin", "layout");
}

export async function setSeo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("productId"));
  const clean = (k: string) => String(formData.get(k) ?? "").trim() || null;
  await prisma.product.update({
    where: { id },
    data: { title: clean("title") ?? undefined, seoTitle: clean("seoTitle"), seoDescription: clean("seoDescription"), description: clean("description") ?? undefined },
  });
  revalidatePath("/admin/products"); revalidatePath("/", "layout");
}
