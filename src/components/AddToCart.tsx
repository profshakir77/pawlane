"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Price, useShop } from "./ShopProvider";

type V = { id: string; name: string; priceCents: number; compareAtCents: number | null; stock: number; image: string | null };

export function AddToCart({ product, variants }: { product: { title: string; slug: string; image?: string }; variants: V[] }) {
  const { add } = useShop();
  const [vid, setVid] = useState(variants.find((v) => v.stock > 0)?.id ?? variants[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const v = variants.find((x) => x.id === vid)!;
  const save = v.compareAtCents && v.compareAtCents > v.priceCents ? Math.round((1 - v.priceCents / v.compareAtCents) * 100) : 0;
  const soldOut = v.stock <= 0;

  // Sticky mobile bar appears once the main button scrolls out of view.
  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const onAdd = () => {
    add({ variantId: v.id, quantity: qty, title: product.title, variantName: v.name, priceCents: v.priceCents, image: v.image ?? product.image, slug: product.slug });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline gap-3">
        <Price cents={v.priceCents} className="font-display text-3xl" />
        {save > 0 && (
          <>
            <Price cents={v.compareAtCents!} className="text-lg text-ink/40 line-through" />
            <span className="rounded-full bg-clay/10 px-2.5 py-1 text-xs font-semibold text-clay">Save {save}%</span>
          </>
        )}
      </div>
      <p className="-mt-3 text-xs text-ink/55">Free tracked shipping included. Taxes calculated at checkout.</p>

      {variants.length > 1 && (
        <fieldset>
          <legend className="mb-3 text-xs font-semibold uppercase tracking-caps">
            Option: <span className="font-normal normal-case tracking-normal text-ink/70">{v.name}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {variants.map((x) => (
              <button key={x.id} type="button" disabled={x.stock <= 0} onClick={() => setVid(x.id)} aria-pressed={x.id === vid}
                className={`rounded-md border px-4 py-2.5 text-sm transition disabled:line-through disabled:opacity-40 ${x.id === vid ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}>
                {x.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex gap-3">
        <div className="flex items-center rounded-full border border-line">
          <button type="button" aria-label="Decrease quantity" className="h-12 w-11 text-lg disabled:opacity-30" disabled={qty <= 1} onClick={() => setQty(qty - 1)}>&minus;</button>
          <span className="w-6 text-center text-sm font-medium" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Increase quantity" className="h-12 w-11 text-lg disabled:opacity-30" disabled={qty >= Math.min(10, v.stock)} onClick={() => setQty(qty + 1)}>+</button>
        </div>
        <button ref={btnRef} className="btn-primary flex-1" disabled={soldOut} onClick={onAdd}>
          {soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}
        </button>
      </div>

      {added && (
        <Link href="/cart" className="btn-ghost w-full">View cart &amp; checkout</Link>
      )}

      {!soldOut && v.stock < 15 && (
        <p className="flex items-center gap-2 text-sm text-clay">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-clay opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-clay" /></span>
          Only {v.stock} left in stock
        </p>
      )}
      {!soldOut && v.stock >= 15 && (
        <p className="flex items-center gap-2 text-sm text-moss"><span className="h-2 w-2 rounded-full bg-moss" /> In stock, ready to ship</p>
      )}

      {/* Sticky mobile add-to-cart */}
      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 p-3 backdrop-blur transition-transform duration-300 md:hidden ${showBar ? "translate-y-0" : "translate-y-full"}`}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{product.title}</p>
            <Price cents={v.priceCents} className="text-sm text-ink/70" />
          </div>
          <button className="btn-primary px-6 py-3" disabled={soldOut} onClick={onAdd}>
            {soldOut ? "Sold out" : added ? "Added ✓" : "Add to cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
