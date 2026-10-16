import { SocialLinks } from "@/components/SocialLinks";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ShopProvider } from "@/components/ShopProvider";
import { currencyForCountry, getRates } from "@/lib/currency";
import { prisma } from "@/lib/db";
import { categorySlug } from "@/lib/seo";
import { SUPPORT_EMAIL } from "@/lib/business";
import { LogoMark } from "@/components/Logo";
import { PaymentBadges } from "@/components/PaymentBadges";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const rates = await getRates();
  const cats = (await prisma.product.findMany({ where: { active: true }, distinct: ["category"], select: { category: true } }))
    .map((c) => c.category).sort();
  const currency = cookies().get("currency")?.value ?? currencyForCountry(headers().get("x-vercel-ip-country"));
  const name = process.env.NEXT_PUBLIC_STORE_NAME ?? "Wrenpaw";

  return (
    <ShopProvider rates={rates} initialCurrency={currency}>
      <Header categories={cats} />
      <main>{children}</main>

      <footer className="mt-28 bg-ink text-paper">
        <div className="container-x grid gap-12 py-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="flex items-center gap-3 font-display text-3xl"><LogoMark size={40} />{name}</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/65">
              Thoughtfully chosen essentials for dogs and cats. Every piece is picked to fix a real everyday problem, shipped free and backed by a 30-day return window.
            </p>
            {!SUPPORT_EMAIL.endsWith("example.com") && (
              <a href={`mailto:${SUPPORT_EMAIL}`} className="mt-6 inline-block border-b border-paper/30 pb-0.5 text-sm hover:border-paper">{SUPPORT_EMAIL}</a>
            )}
            <SocialLinks className="mt-6 text-paper" />
          </div>
          <nav aria-label="Shop by category" className="md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-caps text-paper/45">Shop</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {cats.map((c) => <li key={c}><Link href={`/category/${categorySlug(c)}`} className="text-paper/80 hover:text-paper">{c}</Link></li>)}
            </ul>
          </nav>
          <nav aria-label="Help" className="md:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-caps text-paper/45">Help</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/track" className="text-paper/80 hover:text-paper">Track an order</Link></li>
              <li><Link href="/shipping-returns" className="text-paper/80 hover:text-paper">Shipping &amp; returns</Link></li>
              <li><Link href="/contact" className="text-paper/80 hover:text-paper">Contact</Link></li>
              <li><Link href="/guides" className="text-paper/80 hover:text-paper">Buying guides</Link></li>
            </ul>
          </nav>
          <nav aria-label="Company" className="md:col-span-3">
            <p className="text-[11px] font-semibold uppercase tracking-caps text-paper/45">Company</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/about" className="text-paper/80 hover:text-paper">About us</Link></li>
              <li><Link href="/privacy" className="text-paper/80 hover:text-paper">Privacy policy</Link></li>
              <li><Link href="/terms" className="text-paper/80 hover:text-paper">Terms of service</Link></li>
              <li><Link href="/ownership" className="text-paper/80 hover:text-paper">Ownership</Link></li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-paper/10">
          <div className="container-x flex flex-col gap-3 py-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} {name}. All rights reserved.</p>
            <PaymentBadges dark />
          </div>
        </div>
      </footer>
    </ShopProvider>
  );
}
