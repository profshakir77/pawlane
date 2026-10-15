export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");
export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "Pawlane";
export const abs = (path: string) => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

// Supplier titles are keyword soup ("2026 New Hot Sale Pet Dog Bed Wholesale").
// Google ranks and shoppers click clean, specific titles.
const JUNK = /\b(20\d\d|new|hot|sale|selling|best ?seller|dropshipping|drop ?shipping|wholesale|free shipping|high quality|factory|direct|cross[- ]border|amazon|ebay|aliexpress)\b/gi;
export function cleanTitle(raw: string) {
  const t = raw.replace(JUNK, " ").replace(/[|/_]+/g, " ").replace(/\s{2,}/g, " ").trim();
  const cased = t.toLowerCase().replace(/(^|\s)([a-z])/g, (_, s, c) => s + c.toUpperCase());
  return cased.length > 70 ? cased.slice(0, 70).replace(/\s+\S*$/, "") : cased;
}

export const categorySlug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Intro copy per category. Unique text on category pages is what lets them rank.
export const CATEGORY_COPY: Record<string, { title: string; intro: string }> = {
  Beds: { title: "Dog and cat beds", intro: "Watch how your pet sleeps tonight. Curled up tight? Get a round bed with a raised rim. Flat out on their side? Skip the donut beds and go for something long and flat. Every cover here zips off and goes in the washing machine, because they will get gross." },
  Feeding: { title: "Slow feeders, lick mats and water fountains", intro: "For the dog who finishes dinner in nine seconds, the cat who won't touch a water bowl, and everyone who needs ten quiet minutes while the pet is busy licking peanut butter off a mat." },
  Grooming: { title: "Brushes and grooming tools", intro: "If your sofa is turning the colour of your dog, start here. A few minutes with a slicker brush most days beats one big session a month, and most pets come round to it once it's routine." },
  Toys: { title: "Dog and cat toys", intro: "Indoor cats get bored, and bored cats knock things off shelves. Ten or fifteen minutes of proper play a day makes a real difference. Same goes for dogs on rainy days." },
  Walking: { title: "Harnesses and walking gear", intro: "If your arm hurts after every walk, a front-clip harness is worth trying before anything else. Measure around the widest part of the chest before you pick a size. It's the one people get wrong most." },
};
export function categoryCopy(c: string) {
  return CATEGORY_COPY[c] ?? { title: `${c} for dogs and cats`, intro: `${c} for dogs and cats. Free tracked shipping and 30 days to return anything that doesn't suit.` };
}

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

type LdVariant = { sku: string; name: string; priceCents: number; stock: number; image: string | null };
export function productLd(p: { title: string; description: string; slug: string; images: string[]; category: string; variants: LdVariant[] }) {
  const url = abs(`/products/${p.slug}`);
  const until = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.title,
    description: p.description.slice(0, 5000),
    image: p.images.slice(0, 5),
    url,
    category: p.category,
    brand: { "@type": "Brand", name: STORE_NAME },
    sku: p.variants[0]?.sku,
    offers: p.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      name: v.name,
      url,
      price: (v.priceCents / 100).toFixed(2),
      priceCurrency: "USD",
      priceValidUntil: until,
      availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "USD" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 3, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 7, maxValue: 15, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
      },
    })),
  };
}

export const orgLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": abs("/#org"), name: STORE_NAME, url: SITE_URL },
    { "@type": "WebSite", "@id": abs("/#site"), name: STORE_NAME, url: SITE_URL, publisher: { "@id": abs("/#org") } },
  ],
});
