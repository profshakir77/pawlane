import type { Metadata } from "next";
import { Bricolage_Grotesque, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/seo";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700", "800"] });
const body = Nunito_Sans({ subsets: ["latin"], variable: "--font-body" });

const name = process.env.NEXT_PUBLIC_STORE_NAME ?? "Pawlane";
const description = "Dog and cat beds, lick mats, brushes, harnesses and water fountains we use with our own pets. Free tracked shipping worldwide and 30-day returns.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${name}: Pet Supplies with Free Worldwide Shipping`, template: `%s | ${name}` },
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: name, description, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large", "max-snippet": -1 } },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
