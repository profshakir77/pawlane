import Link from "next/link";
import { Prose } from "@/components/Prose";

export const metadata = { title: "About us", description: "Who runs Pawlane and how we choose what to sell.", alternates: { canonical: "/about" } };

export default function About() {
  return (
    <Prose title="About us">
      {/* Replace this paragraph with your own story, in your own words. A true, specific story sells better than a polished one. */}
      <p>Pawlane is a small online shop for dog and cat owners. We keep the range short on purpose: each product is there because it deals with one specific, everyday problem, like a dog who eats too fast or a cat who doesn't drink enough.</p>
      <h2>How we pick products</h2>
      <p>We order samples and check them before they go on the site. If it's flimsy, hard to clean, or the reviews say pets lose interest after a day, we leave it out. We'd rather sell twenty things that work than two hundred that might.</p>
      <h2>How it gets to you</h2>
      <p>We work with warehouse partners who pack and ship your order directly, which is how we keep prices down and ship free to over 40 countries. The trade-off is time: most orders take 7 to 15 business days. Every parcel is tracked, and the details are on our <Link href="/shipping-returns">shipping page</Link>.</p>
      <h2>Talk to us</h2>
      <p>Questions about sizing, an order, or whether something will suit your pet? <Link href="/contact">Send us a message</Link>. A real person replies, usually within a day.</p>
    </Prose>
  );
}
