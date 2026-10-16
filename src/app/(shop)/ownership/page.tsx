import Link from "next/link";
import { Prose } from "@/components/Prose";
import { BUSINESS_LOCATION, OWNER_NAME, SUPPORT_EMAIL } from "@/lib/business";

export const metadata = { title: "Ownership statement", description: "Who owns and runs Wrenpaw.", alternates: { canonical: "/ownership" } };

export default function Ownership() {
  return (
    <Prose title="Ownership statement">
      <p>
        Wrenpaw is an online store owned and operated by {OWNER_NAME || "its founder"} as a sole proprietorship
        {BUSINESS_LOCATION ? <>, based in {BUSINESS_LOCATION}</> : null}.
      </p>
      <h2>What we do</h2>
      <p>We sell pet supplies online. Orders are packed and shipped with tracking by our fulfilment partner, CJ Dropshipping, directly to customers.</p>
      <h2>Payments</h2>
      <p>Card payments are processed securely by Safepay. We never see or store your full card number.</p>
      <h2>Contact</h2>
      <p>Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. See also our <Link href="/terms">terms</Link>, <Link href="/privacy">privacy policy</Link> and <Link href="/shipping-returns">shipping and returns</Link>.</p>
    </Prose>
  );
}
