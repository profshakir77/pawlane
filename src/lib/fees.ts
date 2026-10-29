// Payment processing fees, so profit figures in the admin are realistic.
// Safepay: a percentage of the order (your test payment showed about 6.3% once
// converted to PKR). Set SAFEPAY_FEE_PERCENT in Vercel to your contract rate.
// Stripe: 2.9% + 30c.
export function paymentFeeCents(subtotalCents: number, provider: string | null) {
  if (provider === "stripe") return Math.round(subtotalCents * 0.029) + 30;
  const pct = Number(process.env.SAFEPAY_FEE_PERCENT ?? 6.3);
  return Math.round((subtotalCents * (Number.isFinite(pct) ? pct : 6.3)) / 100);
}

export const profitCents = (o: { subtotalCents: number; costCents: number; paymentProvider: string | null }) =>
  o.subtotalCents - o.costCents - paymentFeeCents(o.subtotalCents, o.paymentProvider);
