import Stripe from "stripe";

let client: Stripe | null = null;
export function stripe() {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  return client;
}

// Countries you ship to. Remove any your supplier cannot reach.
export const SHIP_COUNTRIES = [
  "US", "CA", "GB", "IE", "AU", "NZ", "DE", "FR", "IT", "ES", "NL", "BE", "AT", "PT", "SE",
  "NO", "DK", "FI", "PL", "CZ", "CH", "GR", "AE", "SA", "QA", "KW", "BH", "OM", "IN", "PK",
  "SG", "MY", "JP", "KR", "HK", "PH", "ZA", "MX", "BR", "CL", "IL", "TR",
] as const;
