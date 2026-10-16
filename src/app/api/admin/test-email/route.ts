import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { sendOrderConfirmation } from "@/lib/email";
import { SUPPORT_EMAIL } from "@/lib/business";

// Admin only: sends a sample order confirmation to the store's support inbox,
// so you can check order emails work before real orders come in.
export async function POST() {
  await requireAdmin();
  try {
    const sent = await sendOrderConfirmation({
      number: 0,
      email: SUPPORT_EMAIL,
      name: "Test Customer",
      subtotalCents: 2799,
      items: [{ title: "One-Click Deshedding Brush (TEST EMAIL)", quantity: 1, unitPriceCents: 2799 }],
    });
    return NextResponse.json(sent ? { ok: true, to: SUPPORT_EMAIL } : { ok: false, error: "Email service not configured" }, { status: sent ? 200 : 400 });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e).slice(0, 300) }, { status: 502 });
  }
}
