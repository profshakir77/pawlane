"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { formatPrice, type Rates } from "@/lib/currency";

export type CartLine = {
  variantId: string; quantity: number; title: string; variantName: string;
  priceCents: number; image?: string; slug: string;
};

type Ctx = {
  cart: CartLine[];
  add: (line: CartLine) => void;
  setQty: (variantId: string, qty: number) => void;
  clear: () => void;
  currency: string;
  setCurrency: (c: string) => void;
  price: (cents: number) => string;
};

const ShopCtx = createContext<Ctx | null>(null);
export const useShop = () => useContext(ShopCtx)!;

export function ShopProvider({ children, rates, initialCurrency }: { children: React.ReactNode; rates: Rates; initialCurrency: string }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [currency, setCur] = useState(initialCurrency);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("cart") ?? "[]")); } catch {}
  }, []);
  const save = (next: CartLine[]) => {
    setCart(next);
    try { localStorage.setItem("cart", JSON.stringify(next)); } catch {}
  };

  return (
    <ShopCtx.Provider
      value={{
        cart,
        add: (line) => {
          const existing = cart.find((l) => l.variantId === line.variantId);
          save(existing
            ? cart.map((l) => (l.variantId === line.variantId ? { ...l, quantity: Math.min(20, l.quantity + line.quantity) } : l))
            : [...cart, line]);
        },
        setQty: (id, qty) => save(qty <= 0 ? cart.filter((l) => l.variantId !== id) : cart.map((l) => (l.variantId === id ? { ...l, quantity: Math.min(20, qty) } : l))),
        clear: () => save([]),
        currency,
        setCurrency: (c) => {
          setCur(c);
          document.cookie = `currency=${c}; path=/; max-age=31536000`;
        },
        price: (cents) => formatPrice(cents, currency, rates),
      }}
    >
      {children}
    </ShopCtx.Provider>
  );
}

export function Price({ cents, className }: { cents: number; className?: string }) {
  const { price } = useShop();
  return <span className={className}>{price(cents)}</span>;
}
