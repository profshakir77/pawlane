"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useShop } from "@/components/ShopProvider";

export default function Success({ searchParams }: { searchParams: { order?: string } }) {
  const { clear } = useShop();
  useEffect(() => { clear(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-5xl font-extrabold">Thanks, that's ordered</h1>
      <p className="mt-4 text-lg">Your order number is <strong>#{searchParams.order}</strong>. Your receipt should land in your inbox in a minute or two.</p>
      <p className="mt-2 text-ink/70">It takes a couple of days to pack and hand over to the courier. Once it moves, the tracking number shows up on the tracking page.</p>
      <Link href="/track" className="btn-primary mt-8">Track this order</Link>
    </div>
  );
}
