"use client";
import Link from "next/link";
import { useState } from "react";
import { CURRENCIES } from "@/lib/currency";
import { useShop } from "./ShopProvider";
import { Logo } from "./Logo";

const slug = (c: string) => c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function Header({ categories = [] }: { categories?: string[] }) {
  const NAV = [
    { href: "/#shop", label: "Shop all" },
    ...categories.slice(0, 4).map((c) => ({ href: `/category/${slug(c)}`, label: c })),
    { href: "/guides", label: "Journal" },
  ];
  const { cart, currency, setCurrency } = useShop();
  const [open, setOpen] = useState(false);
  const count = cart.reduce((s, l) => s + l.quantity, 0);
  const name = process.env.NEXT_PUBLIC_STORE_NAME ?? "Wrenpaw";

  return (
    <>
      <div className="bg-ink text-paper">
        <p className="container-x py-2.5 text-center text-[11px] font-medium uppercase tracking-caps">
          Free tracked shipping worldwide <span className="mx-2 opacity-40">·</span> 30-day returns
        </p>
      </div>
      <header className="sticky top-0 z-30 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center sm:h-20">
          <div className="flex items-center gap-7">
            <button type="button" className="-ml-2 p-2 lg:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 7h18M3 12h18M3 17h18" />}
              </svg>
            </button>
            <nav className="hidden gap-7 text-[13px] font-medium lg:flex">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform hover:after:scale-x-100">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" aria-label={`${name} home`}>
            <Logo name={name} />
          </Link>

          <div className="flex items-center justify-end gap-2 sm:gap-4">
            <Link href="/track" className="hidden text-[13px] font-medium hover:text-moss md:block">Track order</Link>
            <label className="sr-only" htmlFor="cur">Currency</label>
            <select id="cur" value={currency} onChange={(e) => setCurrency(e.target.value)}
              className="cursor-pointer rounded-full border border-line bg-transparent px-3 py-1.5 text-xs font-medium outline-none hover:border-ink">
              {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <Link href="/cart" aria-label={`Cart, ${count} items`} className="relative p-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 7h12l-1 13H7L6 7z" /><path d="M9 7a3 3 0 016 0" />
              </svg>
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ink px-1 text-[10px] font-semibold text-paper">{count}</span>
              )}
            </Link>
          </div>
        </div>

        {open && (
          <nav className="border-t border-line bg-paper lg:hidden">
            <div className="container-x flex flex-col py-3">
              {[...NAV, { href: "/track", label: "Track order" }].map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="border-b border-line py-3.5 font-display text-xl last:border-0">
                  {n.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
