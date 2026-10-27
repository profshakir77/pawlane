import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { markOrderPaid } from "@/lib/orders";
import { safepayTrackerIsPaid, verifySafepayRedirect } from "@/lib/safepay";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Safepay sends the shopper back here after paying, with `tracker` and `sig`
// (HMAC of the tracker with our secret). Accept both POST form and GET query.
async function handle(req: Request) {
  const url = new URL(req.url);
  const params = new URLSearchParams(url.search);
  if (req.method === "POST") {
    const type = req.headers.get("content-type") ?? "";
    if (type.includes("application/json")) {
      const j = await req.json().catch(() => ({}));
      for (const [k, v] of Object.entries(j ?? {})) if (typeof v === "string") params.set(k, v);
    } else {
      const form = await req.formData().catch(() => null);
      form?.forEach((v, k) => { if (typeof v === "string") params.set(k, v); });
    }
  }

  const tracker = params.get("tracker") ?? params.get("token") ?? "";
  const sig = params.get("sig") ?? params.get("signature") ?? "";
  const number = Number(params.get("order") ?? params.get("order_id") ?? params.get("reference"));

  const fail = (reason: string) => NextResponse.redirect(`${SITE_URL}/checkout?failed=${encodeURIComponent(reason)}`, 303);

  // Safepay may redirect with only the tracker and no signature; in that case confirm
  // payment by asking Safepay directly.
  const verified = sig ? verifySafepayRedirect(tracker, sig) : await safepayTrackerIsPaid(tracker);
  if (!verified) return fail("verify");

  // The tracker was created server-side for this exact order total, so a valid
  // signature on it proves this order was paid.
  const order = await prisma.order.findFirst({ where: { paymentRef: tracker, paymentProvider: "safepay" } });
  if (!order || (number && order.number !== number)) return fail("order");

  await markOrderPaid(order.id);
  return NextResponse.redirect(`${SITE_URL}/checkout/success?order=${order.number}&v=${(order.subtotalCents / 100).toFixed(2)}`, 303);
}

export const GET = handle;
export const POST = handle;
