// Bundles: buy every product in a set and save BUNDLE_PERCENT on those items.
// The same rule runs in the cart, at checkout and on the server, so the
// price the customer sees is always the price they pay.
export const BUNDLE_PERCENT = 10;

export type Bundle = { id: string; name: string; blurb: string; slugs: string[] };

export const BUNDLES: Bundle[] = [
  {
    id: "cat-starter",
    name: "Cat starter kit",
    blurb: "Somewhere to scratch, fresh running water and a toy for play time.",
    slugs: [
      "cat-scratcher-sisal-mat-board-396672",
      "cat-automatic-water-dispenser-flow-mute-circulating-filter-c-604900",
      "cat-teaser-stick-retractable-cat-wand-with-replacement-head--156352",
    ],
  },
  {
    id: "dog-road-trip",
    name: "Dog road trip kit",
    blurb: "Keeps the car clean, the dog dry and the fur off your clothes.",
    slugs: [
      "car-pet-mat-car-dog-mat-car-rear-waterproof-pet-dog-mat-pet--492352",
      "transparent-waterproof-rainbow-dog-raincoat-619700",
      "sticky-hair-roller-high-viscosity-strong-roller-tear-type-re-690752",
    ],
  },
  {
    id: "dog-mealtime",
    name: "Calmer mealtime kit",
    blurb: "A raised stand, a slow feeder and a puzzle game for dogs who eat too fast.",
    slugs: [
      "adjustable-lifting-dog-bowl-food-basin-integrated-609100",
      "pet-dog-cat-slow-feeder-bowls-anti-choking-slow-feeder-dish--969984",
      "dog-pets-puzzle-toys-slow-feeder-interactive-increase-puppy--011392",
    ],
  },
];

export const bundleForSlug = (slug: string) => BUNDLES.find((b) => b.slugs.includes(slug));

type Line = { slug: string; priceCents: number; quantity: number };

// One full set of a bundle earns the discount on one unit of each item in it.
// Two full sets earn it twice. The cheapest unit of each product is used.
export function bundleDiscountCents(lines: Line[]): number {
  let total = 0;
  for (const b of BUNDLES) {
    const per = b.slugs.map((s) => lines.filter((l) => l.slug === s));
    if (per.some((ls) => ls.length === 0)) continue;
    const sets = Math.min(...per.map((ls) => ls.reduce((n, l) => n + l.quantity, 0)));
    const setPrice = per.reduce((sum, ls) => sum + Math.min(...ls.map((l) => l.priceCents)), 0);
    total += Math.round((setPrice * sets * BUNDLE_PERCENT) / 100);
  }
  return total;
}
