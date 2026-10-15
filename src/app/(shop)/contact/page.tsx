import Link from "next/link";
import { Prose } from "@/components/Prose";
import { SUPPORT_EMAIL } from "@/lib/business";

export const metadata = { title: "Contact", description: "How to reach the Wrenpaw team about an order or a product.", alternates: { canonical: "/contact" } };

export default function Contact() {
  return (
    <Prose title="Contact us">
      <p>Email is the quickest way to reach us: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
      <p>We reply to everything, normally within one business day. If it's about an order, put your order number in the subject line and we can skip the back and forth.</p>
      <p>Just want to know where your parcel is? The <Link href="/track">tracking page</Link> is faster.</p>
    </Prose>
  );
}
