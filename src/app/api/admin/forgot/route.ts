import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createResetToken } from "@/lib/admin-password";
import { sendAdminPasswordReset } from "@/lib/email";
import { SITE_URL } from "@/lib/seo";

// Always answers the same way, so it never reveals which email is the admin's.
export async function POST(req: Request) {
  const { email = "" } = await req.json().catch(() => ({}));
  const admin = String(process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const reply = NextResponse.json({ ok: true, message: "If that's the admin email, a reset link is on its way." });
  if (!admin || String(email).trim().toLowerCase() !== admin) return reply;

  // At most one reset email every 2 minutes.
  const last = await prisma.setting.findUnique({ where: { key: "admin_reset_sent_at" } });
  if (last && Date.now() - Number(last.value) < 120_000) return reply;
  await prisma.setting.upsert({ where: { key: "admin_reset_sent_at" }, create: { key: "admin_reset_sent_at", value: String(Date.now()) }, update: { value: String(Date.now()) } });

  const token = await createResetToken();
  await sendAdminPasswordReset(admin, `${SITE_URL}/admin/reset?token=${encodeURIComponent(token)}`).catch(() => false);
  return reply;
}
