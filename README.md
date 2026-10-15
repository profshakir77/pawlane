# Pawlane: worldwide pet products dropshipping store

Next.js 14 (App Router) + Prisma/Postgres + Stripe Checkout, with an admin panel and automatic supplier sync (CJ Dropshipping adapter included, plus a demo supplier for local testing).

## Why pet products

Pet supplies are one of the steadiest dropshipping niches worldwide: owners buy emotionally, buy repeatedly (toys, chews, grooming), and the products are light and cheap to ship. Trend niches (gadgets, viral beauty) spike and die; pets stay. The demo catalog is pet products, but nothing in the code is niche-specific. Change the copy in `src/app/(shop)/page.tsx` and import different products to switch niche.

## What it does

**Storefront**
- Product grid with category filter, product pages with variants, stock warnings, SEO metadata
- Cart saved in the browser, prices shown in 9 currencies (auto-detected from visitor country on Vercel, live exchange rates)
- Stripe Checkout: cards, Apple Pay, Google Pay, promo codes, address collection for 40+ countries, free shipping option
- Order tracking page (order number + email)

**Admin panel** (`/admin`)
- Overview: 30-day revenue, profit after supplier cost and card fees, failed orders, low stock, sync log
- Products: cost, price, margin (red under 40%), stock; edit price (locks it), hide/show
- Orders: filter by status, profit per order, supplier order ids, tracking links, one-click "Send to supplier" retry
- Find products: search the supplier catalog, see cost vs suggested price, import with one click

**Automation**
- Paid order (Stripe webhook) is sent to the supplier automatically, split per supplier if a cart mixes suppliers
- Every 6 hours (Vercel cron): refresh supplier costs and stock, reprice by your markup rule, hide products the supplier dropped, pull tracking numbers, mark orders shipped/delivered, retry orders that failed to send
- Prices are always recalculated from the database at checkout; the browser cannot change them

## Setup

```bash
npm install
cp .env.example .env        # fill in values
npx prisma db push          # create tables
npm run db:seed             # load 6 demo products from the mock supplier
npm run dev
```

Open http://localhost:3000 for the store and http://localhost:3000/admin for the admin.

### Stripe
1. Put your test secret key in `STRIPE_SECRET_KEY`.
2. Local webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`, copy the `whsec_...` into `STRIPE_WEBHOOK_SECRET`.
3. Production: add a webhook endpoint at `https://yourdomain.com/api/webhooks/stripe` for `checkout.session.completed` and `checkout.session.expired`.
4. Turn on **Adaptive Pricing** in the Stripe dashboard so foreign customers pay in their own currency.

Note: Stripe does not onboard businesses registered in Pakistan. You need a company or account in a supported country (e.g. UK LTD, US LLC via Stripe Atlas, or UAE). Alternatives are Paddle, Lemon Squeezy, or PayPal; only `src/app/api/checkout` and the webhook would change.

### CJ Dropshipping
1. Create a CJ account, get an API key from the CJ developer page, set `CJ_API_KEY` and `DEFAULT_SUPPLIER=cj`.
2. Keep `CJ_AUTO_PAY=false` at first: orders are created in CJ and you pay them in CJ's dashboard. Switch to `true` once you trust the flow and keep a CJ wallet balance.
3. CJ changes field names occasionally. All CJ-specific code is in `src/lib/suppliers/cj.ts`; check it against https://developers.cjdropshipping.com before going live.

### Adding another supplier
Implement the `SupplierAdapter` interface in `src/lib/suppliers/types.ts` (search, getProduct, getStock, createOrder, getTracking) and register it in `src/lib/suppliers/index.ts`. Everything else works unchanged.

### Deploy (Vercel)
Push to GitHub, import into Vercel, add the env vars, attach a Postgres database. `vercel.json` already schedules the sync every 6 hours (sends `CRON_SECRET` automatically). Run `npm run sync` locally to trigger it by hand.

## SEO built in

- Clean product titles on import (supplier junk like "2026 New Hot Sale Wholesale" stripped)
- Per-page titles, meta descriptions, canonical URLs, Open Graph images
- Structured data: Product with offers, free shipping and 30-day returns (eligible for Google rich results and price/shipping badges), BreadcrumbList, ItemList, Organization, WebSite, Article
- Indexable category pages at `/category/<name>` with unique intro copy (edit `CATEGORY_COPY` in `src/lib/seo.tsx`)
- Buying guides at `/guides` (add more in `src/content/guides.ts`), linked to and from product and category pages
- `sitemap.xml` and `robots.txt` generated from the database; admin, cart, checkout and tracking are kept out of Google
- Google Merchant Center feed at `/feed.xml` for free Shopping listings
- Admin editor for product name, search title, search description and body text

### SEO launch checklist
1. Buy a short brandable .com and deploy on it. Set `NEXT_PUBLIC_SITE_URL` to the final https URL.
2. Google Search Console: verify the domain (put the code in `GOOGLE_SITE_VERIFICATION`), submit `/sitemap.xml`.
3. Google Merchant Center: add the store, submit `/feed.xml`, enable free listings, set shipping (free, 7 to 15 days) and returns (30 days).
4. Bing Webmaster Tools: import from Search Console (also feeds ChatGPT search and DuckDuckGo).
5. Rewrite every product description in the admin. Duplicate supplier text is on hundreds of other stores.
6. Publish one buying guide a week answering a real question ("best harness for a dog that pulls").
7. Pinterest: claim the site and pin every product image. Pet content does very well there and the traffic is free.

## Pricing rule

`price = max(cost x MARKUP_MULTIPLIER, cost + MIN_PROFIT_CENTS)`, rounded up to .99. Defaults: 2.5x and at least $8 profit, shipping baked in. Compare-at price is shown 40% higher. Edit a price in the admin to override it for that product.

## Honest numbers

Typical dropshipping math per order: sell at $30, supplier + shipping $11, card fees $1.20, ads $8 to $15. That leaves $3 to $10. Profit comes from finding the 1 in 20 products that converts, then scaling ad spend on it. Track ad spend per product; the admin profit figure does not include it.

## Before going live
- Add pages for privacy policy, terms, refund policy and contact (Stripe and ad platforms require them)
- Replace demo images and copy with real product photos you are allowed to use
- Add order confirmation and shipping emails (Stripe sends receipts; add Resend or similar for shipping notices)
- Set up Meta Pixel / TikTok Pixel and Google Analytics
