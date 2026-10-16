// Turns a supplier cost into a retail price. Shipping is baked into the
// price so customers see "free shipping", which converts better worldwide.
export function retailPrice(costCents: number): number {
  const mult = Number(process.env.MARKUP_MULTIPLIER ?? 2.5);
  const minProfit = Number(process.env.MIN_PROFIT_CENTS ?? 800);
  const raw = Math.max(costCents * mult, costCents + minProfit);
  return Math.ceil(raw / 100) * 100 - 1; // ends in .99
}

// "Was" prices must be prices you really charged before (US FTC rules), so
// they stay off until you run a genuine sale. Set NEXT_PUBLIC_SHOW_COMPARE_AT
// to "true" only then.
export const SHOW_COMPARE_AT = process.env.NEXT_PUBLIC_SHOW_COMPARE_AT === "true";

export function compareAtPrice(priceCents: number): number | null {
  if (!SHOW_COMPARE_AT) return null;
  return Math.ceil((priceCents * 1.4) / 100) * 100 - 1;
}

export function marginPct(priceCents: number, costCents: number): number {
  if (!priceCents) return 0;
  return Math.round(((priceCents - costCents) / priceCents) * 100);
}
