import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/seo";
import { Analytics } from "@/components/Analytics";

const display = Fraunces({ subsets: ["latin"], variable: "--font-display", axes: ["opsz", "SOFT"], style: ["normal", "italic"], display: "swap" });
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

const name = process.env.NEXT_PUBLIC_STORE_NAME ?? "Wrenpaw";
const description = "Dog and cat beds, lick mats, brushes, harnesses and water fountains we use with our own pets. Free tracked shipping worldwide and 30-day returns.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${name}: Pet Supplies with Free Worldwide Shipping`, template: `%s | ${name}` },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: name, description, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION, other: process.env.FACEBOOK_DOMAIN_VERIFICATION ? { "facebook-domain-verification": process.env.FACEBOOK_DOMAIN_VERIFICATION } : undefined },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}<Analytics /></body>
    </html>
  );
}
