"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";

// Customers submit; nothing shows on the store until an admin approves it.
export async function submitReview(productId: string, slug: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim().slice(0, 60);
  const email = String(formData.get("email") ?? "").trim().slice(0, 120) || null;
  const body = String(formData.get("body") ?? "").trim().slice(0, 1500);
  const rating = Math.min(5, Math.max(1, parseInt(String(formData.get("rating")), 10) || 0));
  if (String(formData.get("website") ?? "")) return; // spam trap
  if (!name || body.length < 10 || !rating) return;
  await prisma.review.create({ data: { productId, name, email, body, rating } });
  revalidatePath(`/products/${slug}`);
}

export async function approveReview(id: string) {
  await requireAdmin();
  const r = await prisma.review.update({ where: { id }, data: { approved: true }, include: { product: true } });
  revalidatePath("/admin/reviews"); revalidatePath(`/products/${r.product.slug}`);
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const r = await prisma.review.delete({ where: { id }, include: { product: true } });
  revalidatePath("/admin/reviews"); revalidatePath(`/products/${r.product.slug}`);
}
