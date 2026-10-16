"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useShop } from "@/components/ShopProvider";
import { track } from "@/lib/track";
import { ORDER_EMAILS } from "@/lib/business";

export default function Success({ searchParams }: { searchParams: { order?: string; v?: string } }) {
  const { cart, clear } = useShop();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    // Cart is loaded from storage after mount; wait one tick so items are available for the pixel.
    const t = setTimeout(() => {
      fired.current = true;
      const value = Number(searchParams.v) || cart.reduce((s, l) => s + l.priceCents * l.quantity, 0) / 100;
      track("purchase", {
        value, orderId: searchParams.order,
        items: cart.map((l) => ({ id: l.variantId, name: l.title, price: l.priceCents / 100, quantity: l.quantity })),
      });
      clear();
    }, 400);
    return () => clearTimeout(t);
  }, [cart.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container-x py-28 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-moss text-2xl text-paper">&#10003;</span>
      <p className="eyebrow mt-8">Order #{searchParams.order}</p>
      <h1 className="mt-4 text-5xl sm:text-6xl">Thank you, it's ordered</h1>
      <p className="mx-auto mt-5 max-w-lg text-ink/70">
        {ORDER_EMAILS
          ? "A confirmation is on its way to your inbox. "
          : `Please keep your order number, #${searchParams.order ?? ""}. `}
        It takes a couple of days to pack and hand to the courier. Once it moves, the tracking number appears on the tracking page.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/track" className="btn-primary">Track this order</Link>
        <Link href="/#shop" className="btn-ghost">Keep shopping</Link>
      </div>
    </div>
  );
}
