import { Prose } from "@/components/Prose";
import { LEGAL_NAME, SUPPORT_EMAIL } from "@/lib/business";

export const metadata = { title: "Privacy policy", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <Prose title="Privacy policy" updated="October 2026">
      <p>This explains what {LEGAL_NAME} collects when you use this site, why, and what you can do about it.</p>
      <h2>What we collect</h2>
      <ul>
        <li>When you order: your name, email, phone number and delivery address. We need these to get the parcel to you.</li>
        <li>Payment details are handled by our payment processor (Safepay). We never see or store your full card number.</li>
        <li>Your cart and currency choice are saved in your own browser so they're still there when you come back.</li>
        <li>If we use analytics or advertising tools, they may set cookies to count visits and measure which ads work. You can block these in your browser settings.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>Only the companies needed to run the shop: our payment processor, our warehouse and shipping partners so they can deliver your order, and our hosting provider. We don't sell your information to anyone.</p>
      <h2>How long we keep it</h2>
      <p>Order records are kept for as long as tax and accounting rules require, usually around six years. Everything else is deleted when we no longer need it.</p>
      <h2>Your rights</h2>
      <p>You can ask to see the information we hold about you, correct it, or have it deleted. Depending on where you live (for example the EU, UK or California) you may have further rights under local law. Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and we'll sort it out within 30 days.</p>
      <h2>Changes</h2>
      <p>If we change this policy, we'll update the date at the top of the page.</p>
    </Prose>
  );
}
