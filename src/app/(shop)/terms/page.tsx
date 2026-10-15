import Link from "next/link";
import { Prose } from "@/components/Prose";
import { LEGAL_NAME, SUPPORT_EMAIL } from "@/lib/business";

export const metadata = { title: "Terms of sale", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <Prose title="Terms of sale" updated="October 2026">
      <p>These terms apply when you buy from this site, which is run by {LEGAL_NAME}. By placing an order you agree to them.</p>
      <h2>Prices and payment</h2>
      <p>Prices are set in US dollars. Prices shown in other currencies are estimates; the amount you pay is shown at checkout before you confirm. Payment is taken when you place the order.</p>
      <h2>Your order</h2>
      <p>Your order is confirmed once payment goes through. If something turns out to be out of stock, we'll let you know and refund that part of the order straight away.</p>
      <h2>Delivery and returns</h2>
      <p>Delivery times, customs, and how returns work are explained on our <Link href="/shipping-returns">shipping and returns page</Link>, which forms part of these terms.</p>
      <h2>Using our products</h2>
      <p>Please follow the sizing and care notes on each product, and keep an eye on your pet with any new toy or chew until you know how they treat it. Our products aren't a replacement for advice from your vet.</p>
      <h2>If something goes wrong</h2>
      <p>If a product is faulty, we'll replace it or refund you. Nothing in these terms takes away rights you have under consumer law in your country.</p>
      <h2>Questions</h2>
      <p>Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    </Prose>
  );
}
