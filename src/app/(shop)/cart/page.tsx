"use client";
import Link from "next/link";
import { useState } from "react";
import { Price, useShop } from "@/components/ShopProvider";

export default function CartPage() {
  const { cart, setQty, currency } = useShop();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const total = cart.reduce((s, l) => s + l.priceCents * l.quantity, 0);

  async function checkout() {
    setBusy(true); setError("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart.map((l) => ({ variantId: l.variantId, quantity: l.quantity })) }),
    });
    const json = await res.json();
    if (json.url) window.location.href = json.url;
    else { setError(json.error ?? "Checkout could not start. Try again."); setBusy(false); }
  }

  if (!cart.length) {
    return (
      <div className="container-x py-28 text-center">
        <p className="eyebrow">Your cart</p>
        <h1 className="mt-4 text-5xl">Nothing here yet</h1>
        <p className="mx-auto mt-4 max-w-sm text-ink/65">Have a look around. Shipping is free on everything.</p>
        <Link href="/#shop" className="btn-primary mt-9">Shop the collection</Link>
      </div>
    );
  }

  const count = cart.reduce((s, l) => s + l.quantity, 0);
  return (
    <div className="container-x py-12">
      <h1 className="text-5xl">Your cart <span className="align-middle font-body text-base text-ink/50">({count})</span></h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <ul className="divide-y divide-line border-y border-line lg:col-span-7">
          {cart.map((l) => (
            <li key={l.variantId} className="flex gap-5 py-6">
              {l.image && <img src={l.image} alt="" className="h-28 w-24 shrink-0 rounded-md bg-meadow object-cover" />}
              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/products/${l.slug}`} className="font-display text-lg leading-snug hover:text-moss">{l.title}</Link>
                    <p className="mt-1 text-sm text-ink/55">{l.variantName}</p>
                  </div>
                  <Price cents={l.priceCents * l.quantity} className="font-medium" />
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center rounded-full border border-line">
                    <button className="h-9 w-9" onClick={() => setQty(l.variantId, l.quantity - 1)} aria-label="Remove one">&minus;</button>
                    <span className="w-6 text-center text-sm">{l.quantity}</span>
                    <button className="h-9 w-9" onClick={() => setQty(l.variantId, l.quantity + 1)} aria-label="Add one">+</button>
                  </div>
                  <button className="text-xs text-ink/55 underline underline-offset-2 hover:text-ink" onClick={() => setQty(l.variantId, 0)}>Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-lg bg-meadow p-7 lg:sticky lg:top-28 lg:col-span-5">
          <h2 className="text-2xl">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-ink/65">Subtotal</dt><dd><Price cents={total} /></dd></div>
            <div className="flex justify-between"><dt className="text-ink/65">Shipping</dt><dd className="font-medium text-moss">Free</dd></div>
            <div className="flex justify-between border-t border-ink/10 pt-4 text-lg font-medium"><dt>Total</dt><dd><Price cents={total} /></dd></div>
          </dl>
          {currency !== "USD" && <p className="mt-3 text-xs text-ink/55">Prices in {currency} are estimates. Checkout shows the exact amount in your currency where available.</p>}
          {error && <p role="alert" className="mt-4 rounded-md bg-clay/10 p-3 text-sm text-clay">{error}</p>}
          <button onClick={checkout} disabled={busy} className="btn-primary mt-6 w-full">{busy ? "Opening secure checkout..." : "Checkout securely"}</button>
          <ul className="mt-6 space-y-2 text-xs text-ink/60">
            <li>&#10003; Free tracked shipping, 7 to 15 business days</li>
            <li>&#10003; 30 days to return anything</li>
            <li>&#10003; Card, Apple Pay and Google Pay</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
