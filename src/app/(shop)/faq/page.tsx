import Link from "next/link";
import { JsonLd } from "@/lib/seo";

export const metadata = {
  title: "FAQ",
  description: "Answers about Wrenpaw shipping to the USA and Canada, delivery times, tracking, payments, returns, cancellations and pet safety.",
  alternates: { canonical: "/faq" },
};

const FAQS: { q: string; a: string }[] = [
  { q: "Where do you ship?", a: "We currently ship to the United States and Canada. More regions are coming soon." },
  { q: "How long does shipping take?", a: "Orders are processed within 1 to 3 business days. Delivery usually takes 7 to 15 business days depending on your location." },
  { q: "How can I track my order?", a: "Once your order ships, you will receive an email with a tracking number and link." },
  { q: "What payment methods do you accept?", a: "We accept major credit and debit cards through our secure checkout." },
  { q: "Can I return or exchange an item?", a: "Yes. If your item arrives damaged, defective or incorrect, contact us within 30 days of delivery and we will arrange a replacement or refund." },
  { q: "How do I cancel or change my order?", a: "Email us as soon as possible. We can change or cancel orders that have not shipped yet." },
  { q: "How do I contact Wrenpaw?", a: "Email us through the contact page and our team will reply within 24 to 48 hours." },
  { q: "Are your products safe for my pet?", a: "We carefully select products from trusted suppliers. Always check product details and size guides, and supervise your pet with new toys or accessories." },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
};

export default function FaqPage() {
  return (
    <article className="mx-auto max-w-2xl px-5 py-12">
      <JsonLd data={faqLd} />
      <h1 className="text-5xl leading-tight sm:text-6xl">Frequently asked questions</h1>
      <p className="mt-4 text-[17px] leading-relaxed text-ink/70">
        Quick answers about shipping, orders and returns. Can&apos;t find what you need? <Link href="/contact" className="underline">Contact us</Link>.
      </p>
      <div className="mt-10 divide-y divide-line border-y border-line">
        {FAQS.map((f) => (
          <details key={f.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-xl [&::-webkit-details-marker]:hidden">
              {f.q}
              <span aria-hidden className="text-2xl leading-none transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[17px] leading-relaxed text-ink/80">{f.a}</p>
          </details>
        ))}
      </div>
    </article>
  );
}
