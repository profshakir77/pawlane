export type SupplierVariant = {
  supplierVariantId: string;
  name: string;
  sku: string;
  costCents: number;
  image?: string;
  stock?: number;
};

export type SupplierProduct = {
  supplierProductId: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  variants: SupplierVariant[];
};

export type SupplierSummary = {
  supplierProductId: string;
  title: string;
  image?: string;
  costCents: number;
};

export type ShippingAddress = {
  name: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  countryCode: string;
};

export type SupplierOrderInput = {
  reference: string;
  shipping: ShippingAddress;
  items: { supplierVariantId: string; quantity: number }[];
};

export type TrackingInfo = {
  status: "processing" | "shipped" | "delivered" | "cancelled";
  trackingNumber?: string;
  carrier?: string;
  trackingUrl?: string;
};

// Every supplier (CJ, AliExpress, Spocket, your own warehouse) implements this.
export interface SupplierAdapter {
  name: string;
  searchProducts(query: string, page?: number): Promise<SupplierSummary[]>;
  getProduct(id: string): Promise<SupplierProduct | null>;
  getStock(variantIds: string[]): Promise<Record<string, number>>;
  createOrder(input: SupplierOrderInput): Promise<{ supplierOrderId: string }>;
  getTracking(supplierOrderId: string): Promise<TrackingInfo>;
}

export function trackingUrl(num?: string) {
  return num ? `https://t.17track.net/en#nums=${encodeURIComponent(num)}` : undefined;
}
