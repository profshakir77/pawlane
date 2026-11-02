// Store discount codes, percent off the items after any bundle saving.
// The same rule runs at checkout and on the server, so the price shown is the price paid.
export const PROMO_CODES: Record<string, number> = {
  WELCOME10: 10,
};

export function normalizePromo(code?: string | null) {
  const c = (code ?? "").trim().toUpperCase();
  return PROMO_CODES[c] ? c : null;
}

export function promoDiscountCents(code: string | null | undefined, cents: number) {
  const c = normalizePromo(code);
  return c ? Math.round((cents * PROMO_CODES[c]) / 100) : 0;
}
