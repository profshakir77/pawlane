import { prisma } from "../db";
import {
  SupplierAdapter, SupplierProduct, SupplierSummary, TrackingInfo, trackingUrl,
} from "./types";

// CJ Dropshipping API v2. Field names follow CJ's public docs; check
// https://developers.cjdropshipping.com when CJ updates their API.
const BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const TOKEN_KEY = "cj_access_token";

async function getToken(): Promise<string> {
  const cached = await prisma.setting.findUnique({ where: { key: TOKEN_KEY } });
  if (cached) {
    const { token, expires } = JSON.parse(cached.value);
    if (Date.now() < expires) return token;
  }
  if (!process.env.CJ_API_KEY) throw new Error("CJ_API_KEY is not set");
  const res = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: process.env.CJ_API_KEY }),
    cache: "no-store",
  });
  const json = await res.json();
  if (!json?.data?.accessToken) throw new Error(`CJ auth failed: ${json?.message}`);
  const value = JSON.stringify({
    token: json.data.accessToken,
    expires: Date.now() + 14 * 24 * 3600 * 1000, // CJ tokens last ~15 days
  });
  await prisma.setting.upsert({
    where: { key: TOKEN_KEY },
    update: { value },
    create: { key: TOKEN_KEY, value },
  });
  return json.data.accessToken;
}

async function cj<T = any>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "CJ-Access-Token": token },
    cache: "no-store",
  });
  const json = await res.json();
  if (json?.code !== 200 && json?.result !== true) {
    throw new Error(`CJ ${path}: ${json?.message ?? res.status}`);
  }
  return json.data as T;
}

// CJ prices can be "3.2" or a range like "2.10-4.80". Use the high end so
// margins never go negative.
function cents(v: unknown): number {
  const parts = String(v ?? "0").split("-").map((s) => parseFloat(s) || 0);
  return Math.round(Math.max(...parts) * 100);
}

function images(p: any): string[] {
  const raw = p.productImageSet ?? p.productImage ?? [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [String(raw)];
  } catch {
    return raw ? [String(raw)] : [];
  }
}

function stripHtml(html: string) {
  return String(html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export const cjAdapter: SupplierAdapter = {
  name: "cj",

  // CJ keyword search (listV2), best match across all warehouses.
  async searchProducts(query, page = 1): Promise<SupplierSummary[]> {
    const q = new URLSearchParams({ keyWord: query, page: String(page), size: "24", orderBy: "0" });
    const data = await cj<any>(`/product/listV2?${q}`);
    const list = (data?.content ?? []).flatMap((c: any) => c?.productList ?? []);
    return list.map((p: any) => ({
      supplierProductId: String(p.id),
      title: p.nameEn,
      image: p.bigImage,
      costCents: cents(p.sellPrice),
    }));
  },

  async getProduct(id): Promise<SupplierProduct | null> {
    try {
      const p = await cj<any>(`/product/query?pid=${encodeURIComponent(id)}`);
      if (!p) return null;
      return {
        supplierProductId: p.pid,
        title: p.productNameEn,
        description: stripHtml(p.description).slice(0, 2000),
        images: images(p),
        category: p.categoryName ?? "General",
        variants: (p.variants ?? []).map((v: any) => ({
          supplierVariantId: v.vid,
          name: v.variantNameEn || v.variantKey || "Default",
          sku: v.variantSku,
          costCents: cents(v.variantSellPrice),
          image: v.variantImage,
        })),
      };
    } catch (e) {
      if (String(e).includes("not exist")) return null;
      throw e;
    }
  },

  async getStock(variantIds) {
    const out: Record<string, number> = {};
    for (const vid of variantIds) {
      const rows = await cj<any[]>(`/product/stock/queryByVid?vid=${encodeURIComponent(vid)}`);
      out[vid] = (rows ?? []).reduce(
        (sum, r) => sum + Number(r.totalInventoryNum ?? r.storageNum ?? 0),
        0,
      );
    }
    return out;
  },

  async createOrder({ reference, shipping, items }) {
    const data = await cj<any>("/shopping/order/createOrderV2", {
      method: "POST",
      body: JSON.stringify({
        orderNumber: reference,
        shippingCountryCode: shipping.countryCode,
        shippingProvince: shipping.state ?? "",
        shippingCity: shipping.city,
        shippingAddress: [shipping.line1, shipping.line2].filter(Boolean).join(", "),
        shippingZip: shipping.postalCode,
        shippingCustomerName: shipping.name,
        shippingPhone: shipping.phone,
        email: shipping.email,
        logisticName: process.env.CJ_LOGISTIC ?? "CJPacket Ordinary",
        fromCountryCode: "CN",
        products: items.map((i) => ({ vid: i.supplierVariantId, quantity: i.quantity })),
      }),
    });
    const orderId = data?.orderId ?? data;
    if (process.env.CJ_AUTO_PAY === "true") {
      await cj("/shopping/pay/payBalance", { method: "POST", body: JSON.stringify({ orderId }) });
    }
    return { supplierOrderId: String(orderId) };
  },

  async getTracking(supplierOrderId): Promise<TrackingInfo> {
    const d = await cj<any>(`/shopping/order/getOrderDetail?orderId=${encodeURIComponent(supplierOrderId)}`);
    const s = String(d?.orderStatus ?? "").toUpperCase();
    const status: TrackingInfo["status"] =
      s === "DELIVERED" ? "delivered" : s === "SHIPPED" ? "shipped" : s === "CANCELLED" ? "cancelled" : "processing";
    return {
      status,
      trackingNumber: d?.trackNumber || undefined,
      carrier: d?.logisticName || undefined,
      trackingUrl: trackingUrl(d?.trackNumber),
    };
  },
};
