"use client";
import Link from "next/link";
import { CURRENCIES } from "@/lib/currency";
import { useShop } from "./ShopProvider";

export function Header() {
  const { cart, currency, setCurrency } = useShop();
  const count = cart.reduce((s, l) => s + l.quantity, 0);
  return (
    <header className="sticky top-0 z-20 border-b border-ink/10 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-4">
        <Link href="/" className="font-display text-2xl font-extrabold">
          {process.env.NEXT_PUBLIC_STORE_NAME ?? "Pawlane"}
        </Link>
        <nav className="ml-6 hidden gap-5 text-sm font-semibold sm:flex">
          <Link href="/#shop" className="hover:text-moss">Shop</Link>
          <Link href="/guides" className="hover:text-moss">Guides</Link>
          <Link href="/track" className="hover:text-moss">Track order</Link>
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <label className="sr-only" htmlFor="cur">Currency</label>
          <select id="cur" value={currency} onChange={(e) => setCurrency(e.target.value)}
            className="rounded-full border border-ink/20 bg-transparent px-3 py-2 text-sm font-semibold">
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <Link href="/cart" className="btn-primary px-4 py-2 text-sm">
            Cart{count > 0 && <span className="rounded-full bg-biscuit px-2 text-ink">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
