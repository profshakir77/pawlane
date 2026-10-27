import crypto from "crypto";

// Safepay (getsafepay.com): Pakistani payment gateway that accepts local and
// international Visa/Mastercard and settles to your Pakistani bank account.
// Mirrors the official @sfpy/node-sdk v3 flow without the extra dependency.
//
// Env:
//   SAFEPAY_ENV            "sandbox" | "production"
//   SAFEPAY_API_KEY        public client key from the Safepay dashboard
//   SAFEPAY_SECRET_KEY     v1 secret, used to sign the redirect after payment
//   SAFEPAY_WEBHOOK_SECRET webhook shared secret (optional but recommended)
//   SAFEPAY_CURRENCY       "USD" (default) or "PKR"

const ENV = process.env.SAFEPAY_ENV === "production" ? "production" : "sandbox";
const API = ENV === "production" ? "https://api.getsafepay.com" : "https://sandbox.api.getsafepay.com";
const CHECKOUT = ENV === "production" ? "https://getsafepay.com/checkout/pay" : "https://sandbox.api.getsafepay.com/checkout/pay";

export const safepayEnabled = () => !!process.env.SAFEPAY_API_KEY && !!process.env.SAFEPAY_SECRET_KEY;
export const safepayCurrency = () => (process.env.SAFEPAY_CURRENCY === "PKR" ? "PKR" : "USD");

/** Creates a payment tracker. Amount is in major units (dollars, not cents). */
export async function createSafepayTracker(amount: number): Promise<string> {
  const res = await fetch(`${API}/order/v1/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, client: process.env.SAFEPAY_API_KEY, currency: safepayCurrency(), environment: ENV }),
    cache: "no-store",
  });
  const json = await res.json().catch(() => null);
  const token = json?.data?.token;
  if (!res.ok || !token) throw new Error(`Safepay init failed: ${res.status} ${JSON.stringify(json?.status ?? json)?.slice(0, 200)}`);
  return token as string;
}

export function safepayCheckoutUrl(p: { token: string; orderId: string; redirectUrl: string; cancelUrl: string }) {
  const q = new URLSearchParams({
    beacon: p.token,
    cancel_url: p.cancelUrl,
    env: ENV,
    order_id: p.orderId,
    redirect_url: p.redirectUrl,
    source: "custom",
    webhooks: String(!!process.env.SAFEPAY_WEBHOOK_SECRET),
  });
  return `${CHECKOUT}?${q}`;
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

/** Signature Safepay sends back on the redirect: HMAC-SHA256(tracker, v1 secret). */
export function verifySafepayRedirect(tracker: string, sig: string) {
  if (!tracker || !sig) return false;
  // Safepay may sign the redirect with either the API secret key or the webhook
  // shared secret, so accept a match against whichever of them is configured.
  const secrets = [process.env.SAFEPAY_SECRET_KEY, process.env.SAFEPAY_WEBHOOK_SECRET].filter((s): s is string => !!s);
  return secrets.some((secret) => safeEqual(crypto.createHmac("sha256", secret).update(tracker).digest("hex"), sig));
}

/**
 * Safepay's checkout redirect can come back with only `order` and `tracker` (no signature),
 * so confirm payment server-to-server: ask Safepay for the tracker using our merchant secret.
 */
export async function safepayTrackerIsPaid(tracker: string) {
  const secret = process.env.SAFEPAY_SECRET_KEY;
  if (!secret || !/^track_[0-9a-f-]{36}$/i.test(tracker)) return false;
  try {
    const res = await fetch(`${API}/reporter/api/v1/payments/${tracker}`, {
      headers: { "X-SFPY-MERCHANT-SECRET": secret },
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    const d = json?.data ?? {};
    const notificationState = String(d.notification?.state ?? "").toUpperCase();
    const trackerState = String(d.tracker?.state ?? d.state ?? "").toUpperCase();
    // Temporary diagnostics: states and field names only.
    console.log("[safepay-lookup]", res.status, JSON.stringify({ keys: Object.keys(d), notificationState, trackerState }));
    if (!res.ok) return false;
    return notificationState === "PAID" || trackerState === "TRACKER_ENDED";
  } catch {
    return false;
  }
}

/** Webhook signature: HMAC-SHA512(JSON.stringify(body.data), webhook secret) in x-sfpy-signature. */
export function verifySafepayWebhook(data: unknown, signature: string | null) {
  if (!signature || !process.env.SAFEPAY_WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac("sha512", process.env.SAFEPAY_WEBHOOK_SECRET).update(Buffer.from(JSON.stringify(data))).digest("hex");
  return safeEqual(expected, signature);
}
