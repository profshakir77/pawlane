export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "AED", "SAR", "INR", "PKR"] as const;
export type Currency = (typeof CURRENCIES)[number];
export type Rates = Record<string, number>;

const COUNTRY_CURRENCY: Record<string, Currency> = {
  US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", AE: "AED", SA: "SAR", IN: "INR", PK: "PKR",
  DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", IE: "EUR", BE: "EUR", AT: "EUR",
  PT: "EUR", FI: "EUR", GR: "EUR",
};

export function currencyForCountry(country?: string | null): Currency {
  return (country && COUNTRY_CURRENCY[country.toUpperCase()]) || "USD";
}

export async function getRates(): Promise<Rates> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 86400 } });
    const json = await res.json();
    return json?.rates ?? { USD: 1 };
  } catch {
    return { USD: 1 };
  }
}

export function formatPrice(cents: number, currency: string, rates: Rates): string {
  const rate = rates[currency];
  const cur = rate ? currency : "USD";
  return new Intl.NumberFormat("en", { style: "currency", currency: cur }).format(
    (cents / 100) * (rate ?? 1),
  );
}

export function formatUsd(cents: number): string {
  return formatPrice(cents, "USD", { USD: 1 });
}
