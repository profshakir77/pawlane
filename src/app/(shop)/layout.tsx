import { cookies, headers } from "next/headers";
import Link from "next/link";
import { Header } from "@/components/Header";
import { ShopProvider } from "@/components/ShopProvider";
import { currencyForCountry, getRates } from "@/lib/currency";
import { prisma } from "@/lib/db";
import { categorySlug } from "@/lib/seo";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const rates = await getRates();
  const cats = await prisma.product.findMany({ where: { active: true }, distinct: ["category"], select: { category: true } });
  const currency = cookies().get("currency")?.value ?? currencyForCountry(headers().get("x-vercel-ip-country"));
  return (
    <ShopProvider rates={rates} initialCurrency={currency}>
      <Header />
      <main>{children}</main>
      <footer className="mt-24 border-t border-ink/10">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-10 text-sm sm:grid-cols-3">
          <div className="space-y-2">
            <p>Free tracked shipping to 40+ countries. Most parcels take 7 to 15 business days.</p>
            <p>Didn't suit your pet? You have 30 days to send it back.</p>
          </div>
          <nav aria-label="Help" className="flex flex-col gap-1">
            <Link href="/about" className="hover:underline">About us</Link>
            <Link href="/shipping-returns" className="hover:underline">Shipping and returns</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </nav>
          <nav aria-label="Shop by category" className="flex flex-col gap-1 sm:items-end">
            {cats.map(({ category }) => <Link key={category} href={`/category/${categorySlug(category)}`} className="hover:underline">{category}</Link>)}
            <Link href="/guides" className="hover:underline">Buying guides</Link>
            <Link href="/track" className="hover:underline">Track an order</Link>
          </nav>
        </div>
      </footer>
    </ShopProvider>
  );
}
