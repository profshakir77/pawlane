"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Price, useShop } from "@/components/ShopProvider";
import { SHIP_COUNTRIES } from "@/lib/countries";
import { track } from "@/lib/track";
import { PaymentBadges } from "@/components/PaymentBadges";
import { bundleDiscountCents } from "@/lib/bundles";

const FAIL: Record<string, string> = {
  verify: "We couldn't confirm that payment. If you were charged, email us with your order number and we'll sort it out.",
  order: "We couldn't match that payment to an order. If you were charged, email us and we'll sort it out.",
};

export default function CheckoutPage() {
  const { cart } = useShop();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const subtotal = cart.reduce((s, l) => s + l.priceCents * l.quantity, 0);
  const discount = bundleDiscountCents(cart);
  const total = subtotal - discount;
  const count = cart.reduce((s, l) => s + l.quantity, 0);

  const countries = useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try { names = new Intl.DisplayNames(["en"], { type: "region" }); } catch {}
    return [...SHIP_COUNTRIES].map((c) => ({ code: c, name: names?.of(c) ?? c })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("cancelled")) setNotice("Payment was cancelled. Your cart is saved, you can try again whenever you're ready.");
    const f = q.get("failed");
    if (f) setError(FAIL[f] ?? "Something went wrong with the payment. Please try again.");
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    track("begin_checkout", { value: total / 100, items: cart.map((l) => ({ id: l.variantId, name: l.title, price: l.priceCents / 100, quantity: l.quantity })) });
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart.map((l) => ({ variantId: l.variantId, quantity: l.quantity })), customer: f }),
    });
    const json = await res.json().catch(() => ({}));
    if (json.url) window.location.href = json.url;
    else { setError(json.error ?? "Checkout could not start. Please try again."); setBusy(false); }
  }

  if (!cart.length) {
    return (
      <div className="container-x py-28 text-center">
        {notice || error ? <p className="mx-auto mb-8 max-w-lg rounded-md bg-meadow p-4 text-sm">{error || notice}</p> : null}
        <h1 className="text-5xl">Your cart is empty</h1>
        <Link href="/#shop" className="btn-primary mt-9">Shop the collection</Link>
      </div>
    );
  }

  const field = "input";
  return (
    <div className="container-x py-12">
      <nav aria-label="Breadcrumb" className="text-xs text-ink/55"><Link href="/cart" className="hover:text-ink">Cart</Link><span className="mx-2">/</span><span className="text-ink">Shipping</span><span className="mx-2">/</span>Payment</nav>
      <h1 className="mt-4 text-5xl">Checkout</h1>

      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <form onSubmit={submit} className="space-y-8 lg:col-span-7">
          {notice && <p className="rounded-md bg-meadow p-4 text-sm">{notice}</p>}
          {error && <p role="alert" className="rounded-md bg-clay/10 p-4 text-sm text-clay">{error}</p>}

          <fieldset className="space-y-4">
            <legend className="mb-4 font-display text-2xl">Contact</legend>
            <label className="block text-sm">Email<input name="email" type="email" required autoComplete="email" className={`${field} mt-1.5`} /></label>
            <label className="block text-sm">Phone <span className="text-ink/50">(for delivery updates)</span><input name="phone" type="tel" required autoComplete="tel" className={`${field} mt-1.5`} /></label>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-4 font-display text-2xl">Shipping address</legend>
            <label className="block text-sm">Country
              <select name="countryCode" required defaultValue="US" autoComplete="country" className={`${field} mt-1.5`}>
                {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </label>
            <label className="block text-sm">Full name<input name="name" required autoComplete="name" className={`${field} mt-1.5`} /></label>
            <label className="block text-sm">Address<input name="line1" required autoComplete="address-line1" className={`${field} mt-1.5`} /></label>
            <label className="block text-sm">Apartment, suite, etc. <span className="text-ink/50">(optional)</span><input name="line2" autoComplete="address-line2" className={`${field} mt-1.5`} /></label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block text-sm">City<input name="city" required autoComplete="address-level2" className={`${field} mt-1.5`} /></label>
              <label className="block text-sm">State / region<input name="state" autoComplete="address-level1" className={`${field} mt-1.5`} /></label>
              <label className="block text-sm">ZIP / postcode<input name="postalCode" required autoComplete="postal-code" className={`${field} mt-1.5`} /></label>
            </div>
          </fieldset>

          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? "Opening secure payment..." : "Continue to secure payment"}</button>
          <PaymentBadges className="justify-center" />
          <p className="text-center text-xs text-ink/55">You'll pay on our payment partner's secure page by Visa or Mastercard. We never see your card number.</p>
        </form>

        <aside className="h-fit rounded-lg bg-meadow p-7 lg:sticky lg:top-28 lg:col-span-5">
          <h2 className="text-2xl">Order summary <span className="font-body text-sm text-ink/50">({count})</span></h2>
          <ul className="mt-6 space-y-4">
            {cart.map((l) => (
              <li key={l.variantId} className="flex items-center gap-4">
                <span className="relative">
                  {l.image && <img src={l.image} alt="" className="h-16 w-14 rounded-md object-cover" />}
                  <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[10px] text-paper">{l.quantity}</span>
                </span>
                <span className="flex-1 text-sm"><span className="block font-medium">{l.title}</span><span className="text-ink/55">{l.variantName}</span></span>
                <Price cents={l.priceCents * l.quantity} className="text-sm" />
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-3 border-t border-ink/10 pt-5 text-sm">
            <div className="flex justify-between"><dt className="text-ink/65">Subtotal</dt><dd><Price cents={subtotal} /></dd></div>
            {discount > 0 && <div className="flex justify-between text-moss"><dt>Bundle saving</dt><dd>&minus;<Price cents={discount} /></dd></div>}
            <div className="flex justify-between"><dt className="text-ink/65">Shipping</dt><dd className="font-medium text-moss">Free</dd></div>
            <div className="flex justify-between border-t border-ink/10 pt-4 text-lg font-medium"><dt>Total</dt><dd>${(total / 100).toFixed(2)} USD</dd></div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
