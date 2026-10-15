// Fires the same e-commerce event to every ad/analytics pixel that is installed.
// Each pixel is only loaded when its env var is set (see components/Analytics).
type Item = { id: string; name: string; price: number; quantity?: number };
type Payload = { value?: number; currency?: string; items?: Item[]; orderId?: string };

declare global {
  interface Window { fbq?: (...a: unknown[]) => void; gtag?: (...a: unknown[]) => void; ttq?: { track: (...a: unknown[]) => void } }
}

const META: Record<string, string> = { view_item: "ViewContent", add_to_cart: "AddToCart", begin_checkout: "InitiateCheckout", purchase: "Purchase" };
const TIKTOK: Record<string, string> = { view_item: "ViewContent", add_to_cart: "AddToCart", begin_checkout: "InitiateCheckout", purchase: "CompletePayment" };

export function track(event: "view_item" | "add_to_cart" | "begin_checkout" | "purchase", p: Payload = {}) {
  if (typeof window === "undefined") return;
  const currency = p.currency ?? "USD";
  const ids = p.items?.map((i) => i.id) ?? [];
  try {
    window.fbq?.("track", META[event], {
      value: p.value, currency, content_ids: ids, content_type: "product",
      contents: p.items?.map((i) => ({ id: i.id, quantity: i.quantity ?? 1, item_price: i.price })),
    }, p.orderId ? { eventID: `order-${p.orderId}` } : undefined);
  } catch {}
  try {
    window.gtag?.("event", event, {
      value: p.value, currency, transaction_id: p.orderId,
      items: p.items?.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity ?? 1 })),
    });
  } catch {}
  try {
    window.ttq?.track(TIKTOK[event], {
      value: p.value, currency, content_type: "product",
      contents: p.items?.map((i) => ({ content_id: i.id, content_name: i.name, price: i.price, quantity: i.quantity ?? 1 })),
    });
  } catch {}
}
