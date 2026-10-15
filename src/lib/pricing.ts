// Turns a supplier cost into a retail price. Shipping is baked into the
// price so customers see "free shipping", which converts better worldwide.
export function retailPrice(costCents: number): number {
  const mult = Number(process.env.MARKUP_MULTIPLIER ?? 2.5);
  const minProfit = Number(process.env.MIN_PROFIT_CENTS ?? 800);
  const raw = Math.max(costCents * mult, costCents + minProfit);
  return Math.ceil(raw / 100) * 100 - 1; // ends in .99
}

export function compareAtPrice(priceCents: number): number {
  return Math.ceil((priceCents * 1.4) / 100) * 100 - 1;
}

export function marginPct(priceCents: number, costCents: number): number {
  if (!priceCents) return 0;
  return Math.round(((priceCents - costCents) / priceCents) * 100);
}
