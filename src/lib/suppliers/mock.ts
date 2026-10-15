import { SupplierAdapter, SupplierProduct, trackingUrl } from "./types";

// A fake supplier so the whole store works locally without API keys.
const img = (id: string) => `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

export const MOCK_CATALOG: SupplierProduct[] = [
  {
    supplierProductId: "mock-001",
    title: "Self-Warming Calming Donut Bed",
    description: "Round, deep and very soft, with a raised edge your pet can lean their chin on. Dogs who pace at night often settle quicker in something they can curl into. The cover zips off and survives the washing machine. Measure your pet curled up and add about 15 cm when picking a size.",
    images: [img("photo-1601758228041-f3b2795255f1")],
    category: "Beds",
    variants: [
      { supplierVariantId: "mock-001-s", name: "Small (50 cm)", sku: "BED-S", costCents: 980 },
      { supplierVariantId: "mock-001-m", name: "Medium (70 cm)", sku: "BED-M", costCents: 1420 },
      { supplierVariantId: "mock-001-l", name: "Large (90 cm)", sku: "BED-L", costCents: 1890 },
    ],
  },
  {
    supplierProductId: "mock-002",
    title: "Lick Mat Slow Feeder",
    description: "Smear some peanut butter, yoghurt or wet food into the grooves and your dog will spend a good ten minutes working it out. Handy during baths, nail trims, or when you just need to finish a phone call. Food-grade silicone, sticks to the floor or the side of the tub, and goes in the dishwasher.",
    images: [img("photo-1583511655857-d19b40a7a54e")],
    category: "Feeding",
    variants: [
      { supplierVariantId: "mock-002-g", name: "Sage green", sku: "LICK-G", costCents: 210 },
      { supplierVariantId: "mock-002-b", name: "Sky blue", sku: "LICK-B", costCents: 210 },
    ],
  },
  {
    supplierProductId: "mock-003",
    title: "Self-Cleaning Slicker Brush",
    description: "Pulls out the loose undercoat that ends up on your clothes. When the brush is full, press the button on the back, the pins pull in, and the hair slides off in one go. Brush with the coat, not against it, and go gently around the belly and legs.",
    images: [img("photo-1548199973-03cce0bbc87b")],
    category: "Grooming",
    variants: [{ supplierVariantId: "mock-003-d", name: "One size", sku: "BRUSH", costCents: 340 }],
  },
  {
    supplierProductId: "mock-004",
    title: "Interactive Feather Wand for Cats",
    description: "A wand that extends so you can sit on the sofa while your cat does the running. Comes with three spare feathers, because the first one won't last. Drag it along the floor and behind furniture rather than waving it in the air. Most cats hunt low.",
    images: [img("photo-1514888286974-6c03e2ca1dba")],
    category: "Toys",
    variants: [{ supplierVariantId: "mock-004-d", name: "Wand + 3 refills", sku: "WAND", costCents: 260 }],
  },
  {
    supplierProductId: "mock-005",
    title: "No-Pull Reflective Harness",
    description: "The lead clips onto the chest, not the back. When your dog pulls, they get turned gently to the side instead of dragging you forward. It won't fix pulling overnight, but most people notice a difference on the first walk. Reflective stitching helps on dark evenings.",
    images: [img("photo-1543466835-00a7907e9de1")],
    category: "Walking",
    variants: [
      { supplierVariantId: "mock-005-s", name: "S", sku: "HAR-S", costCents: 520 },
      { supplierVariantId: "mock-005-m", name: "M", sku: "HAR-M", costCents: 560 },
      { supplierVariantId: "mock-005-l", name: "L", sku: "HAR-L", costCents: 610 },
    ],
  },
  {
    supplierProductId: "mock-006",
    title: "Filtered Water Fountain 2.5L",
    description: "Lots of cats ignore a bowl of still water but will happily drink from a dripping tap. This gives them the tap all day. Holds 2.5 litres, the pump is quiet enough for a bedroom, and a small light tells you when it needs a top-up. Change the filter every few weeks.",
    images: [img("photo-1574158622682-e40e69881006")],
    category: "Feeding",
    variants: [{ supplierVariantId: "mock-006-d", name: "White", sku: "FOUNT", costCents: 1150 }],
  },
];

export const mockAdapter: SupplierAdapter = {
  name: "mock",
  async searchProducts(query) {
    const q = query.toLowerCase();
    return MOCK_CATALOG.filter((p) => p.title.toLowerCase().includes(q) || !q).map((p) => ({
      supplierProductId: p.supplierProductId,
      title: p.title,
      image: p.images[0],
      costCents: p.variants[0].costCents,
    }));
  },
  async getProduct(id) {
    return MOCK_CATALOG.find((p) => p.supplierProductId === id) ?? null;
  },
  async getStock(ids) {
    return Object.fromEntries(ids.map((id) => [id, 150]));
  },
  async createOrder({ reference }) {
    return { supplierOrderId: `MOCK-${reference}` };
  },
  async getTracking(id) {
    const num = `LP${id.replace(/\D/g, "").padStart(9, "0")}CN`;
    return { status: "shipped", trackingNumber: num, carrier: "Mock Post", trackingUrl: trackingUrl(num) };
  },
};
