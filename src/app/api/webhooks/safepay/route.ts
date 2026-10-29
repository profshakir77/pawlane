import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { markOrderPaid } from "@/lib/orders";
import { verifySafepayWebhook } from "@/lib/safepay";

export const runtime = "nodejs";

// Safepay calls this after every payment (set in Dashboard > Developer > Endpoints).
// It's the most reliable way to learn an order was paid, so the redirect page
// also waits briefly for it.
export async function POST(req: Request) {
  const raw = await req.text();
  let body: any = null;
  try { body = JSON.parse(raw); } catch {}
  // Payload is usually { data: {...} }, but accept the notification on its own too.
  const d = body?.data ?? body;
  if (!d || typeof d !== "object") {
    console.log("[safepay-webhook] rejected: unreadable body");
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }
  if (!verifySafepayWebhook(body?.data ?? body, req.headers.get("x-sfpy-signature"), raw)) {
    console.log("[safepay-webhook] rejected: signature", JSON.stringify({ hasHeader: !!req.headers.get("x-sfpy-signature"), wrapped: !!body?.data, keys: Object.keys(d).slice(0, 15) }));
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const tracker: string | undefined =
    (typeof d.tracker === "string" && d.tracker) || d.tracker?.token || d.notification?.tracker || undefined;
  const state = String(d.state ?? d.tracker?.state ?? d.notification?.state ?? body?.type ?? "").toUpperCase();
  const paid = /PAID|SUCCESS|COMPLETED|PAYMENT:CREATED/.test(state);

  if (tracker && paid) {
    const order = await prisma.order.findFirst({ where: { paymentRef: tracker, paymentProvider: "safepay" } });
    if (order) await markOrderPaid(order.id);
    console.log("[safepay-webhook] paid", JSON.stringify({ found: !!order, number: order?.number }));
  } else {
    console.log("[safepay-webhook] ignored", JSON.stringify({ state, hasTracker: !!tracker }));
  }
  return NextResponse.json({ ok: true });
}
