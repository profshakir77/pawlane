import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { markOrderPaid } from "@/lib/orders";
import { verifySafepayWebhook } from "@/lib/safepay";

export const runtime = "nodejs";

// Backup for shoppers who close the tab before Safepay redirects them back.
// Set this URL as the webhook endpoint in the Safepay dashboard.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.data || !verifySafepayWebhook(body.data, req.headers.get("x-sfpy-signature"))) {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  const d = body.data;
  const tracker: string | undefined =
    (typeof d.tracker === "string" && d.tracker) || d.tracker?.token || d.token || d.notification?.tracker;
  const state = String(d.state ?? d.tracker?.state ?? d.notification?.state ?? body.type ?? "").toUpperCase();
  const paid = /PAID|SUCCESS|COMPLETED|PAYMENT:CREATED/.test(state);

  if (tracker && paid) {
    const order = await prisma.order.findFirst({ where: { paymentRef: tracker, paymentProvider: "safepay" } });
    if (order) await markOrderPaid(order.id);
  }
  return NextResponse.json({ ok: true });
}
