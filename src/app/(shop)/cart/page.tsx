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
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="text-4xl font-extrabold">Nothing in your cart yet</h1>
        <Link href="/#shop" className="btn-primary mt-8">Browse products</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="text-4xl font-extrabold">Cart</h1>
      <ul className="mt-8 divide-y divide-ink/10">
        {cart.map((l) => (
          <li key={l.variantId} className="flex gap-4 py-5">
            {l.image && <img src={l.image} alt="" className="h-20 w-20 rounded-2xl bg-meadow object-cover" />}
            <div className="flex-1">
              <Link href={`/products/${l.slug}`} className="font-bold">{l.title}</Link>
              <p className="text-sm text-ink/60">{l.variantName}</p>
              <div className="mt-2 flex items-center gap-2">
                <button className="h-8 w-8 rounded-full border border-ink/20" onClick={() => setQty(l.variantId, l.quantity - 1)} aria-label="Remove one">-</button>
                <span className="w-6 text-center">{l.quantity}</span>
                <button className="h-8 w-8 rounded-full border border-ink/20" onClick={() => setQty(l.variantId, l.quantity + 1)} aria-label="Add one">+</button>
              </div>
            </div>
            <Price cents={l.priceCents * l.quantity} className="font-semibold" />
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-center justify-between border-t border-ink pt-6 text-xl font-bold">
        <span>Total</span><Price cents={total} />
      </div>
      {currency !== "USD" && <p className="mt-2 text-sm text-ink/60">Prices in {currency} are estimates. Checkout shows the exact amount in your currency where available.</p>}
      {error && <p role="alert" className="mt-4 rounded-xl bg-biscuit/30 p-3">{error}</p>}
      <button onClick={checkout} disabled={busy} className="btn-primary mt-6 w-full">{busy ? "Opening checkout..." : "Check out"}</button>
    </div>
  );
}
