import Link from "next/link";
import { Prose } from "@/components/Prose";

export const metadata = { title: "About us", description: "Who runs Wrenpaw and how we choose what to sell.", alternates: { canonical: "/about" } };

export default function About() {
  return (
    <Prose title="About us">
      {/* Replace this paragraph with your own story, in your own words. A true, specific story sells better than a polished one. */}
      <p>Wrenpaw is a small online shop for dog and cat owners. We keep the range short on purpose: each product is there because it deals with one specific, everyday problem, like a dog who eats too fast or a cat who doesn't drink enough.</p>
      <h2>How we pick products</h2>
      <p>We read supplier details and photos closely and pick items that solve a real, everyday problem. If something looks flimsy, hard to clean, or likely to bore your pet after a day, we leave it out. We'd rather sell a short list of useful things than hundreds that might work.</p>
      <h2>How it gets to you</h2>
      <p>We work with warehouse partners who pack and ship your order directly, which is how we keep prices down and ship free across the USA and Canada. The trade-off is time: most orders take 7 to 15 business days. Every parcel is tracked, and the details are on our <Link href="/shipping-returns">shipping page</Link>.</p>
      <h2>Talk to us</h2>
      <p>Questions about sizing, an order, or whether something will suit your pet? <Link href="/contact">Send us a message</Link>. A real person replies, usually within a day.</p>
    </Prose>
  );
}
