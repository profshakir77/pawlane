import Link from "next/link";
import { Prose } from "@/components/Prose";
import { RETURN_ADDRESS, SUPPORT_EMAIL } from "@/lib/business";

export const metadata = { title: "Shipping and returns", description: "Delivery times, tracking, and how to return something within 30 days.", alternates: { canonical: "/shipping-returns" } };

export default function ShippingReturns() {
  return (
    <Prose title="Shipping and returns" updated="October 2026">
      <h2>Shipping</h2>
      <p>We currently ship to the USA and Canada, and shipping is free on every order. Delivery to the UK and Europe is coming later.</p>
      <ul>
        <li>We take 1 to 3 business days to pack your order.</li>
        <li>Delivery then takes 7 to 15 business days for most countries. Remote areas and busy periods like November and December can take longer.</li>
        <li>Every parcel is tracked. Your tracking number appears on the <Link href="/track">tracking page</Link> once the parcel is moving, usually within 2 to 4 days of ordering.</li>
        <li>If you order several things, they may arrive in separate parcels.</li>
      </ul>
      <h2>Import taxes and duties</h2>
      <p>Orders ship from our fulfilment partner's warehouse, usually outside your country, so import charges can apply:</p>
      <ul>
        <li>United States: low-value parcels no longer enter duty free, so duties may be added on delivery.</li>
        <li>Canada: GST/HST, and duty on some items, may apply depending on the order value.</li>
      </ul>
      <p>Any charges your country applies on delivery are paid by the recipient. If you'd like an estimate before you order, email us and we'll tell you what to expect.</p>
      <h2>If your order hasn't arrived</h2>
      <p>If it's been more than 20 business days and the tracking hasn't moved, email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> with your order number. We'll chase it, and if it's lost we'll send a replacement or refund you in full.</p>
      <h2>Returns</h2>
      <p>You have 30 days from delivery to send something back if it didn't suit your pet.</p>
      <ul>
        <li>Email us first with your order number and what you'd like to return.</li>
        <li>Items need to be unused, clean, and in their original packaging. We can't take back things that have been chewed, slept on, or used with food.</li>
        <li>Return postage is paid by you, unless the item arrived damaged or we sent the wrong thing.</li>
        <li>Return address: {RETURN_ADDRESS}</li>
      </ul>
      <p>Once the return arrives, we'll refund the original payment within 5 business days. Your bank may take a few more days to show it.</p>
      <h2>Damaged or wrong item</h2>
      <p>Send us a photo within 7 days of delivery and we'll replace it or refund you. You won't need to send it back.</p>
    </Prose>
  );
}
