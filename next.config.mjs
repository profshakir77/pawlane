import { slugRenames } from "./slug-renames.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Lets /_next/image resize supplier photos (used for social images).
  images: { remotePatterns: [{ protocol: "https", hostname: "cf.cjdropshipping.com" }, { protocol: "https", hostname: "oss-cf.cjdropshipping.com" }] },
  // Old demo product pages (linked from early social posts) now point to the
  // real products that replaced them.
  async redirects() {
    const p = (from, to) => ({ source: `/products/${from}`, destination: to, permanent: true });
    return [
      p("4-colors-gravity-pet-feeder-water-dispenser-cute-cat-shaped--957121", "/products/quiet-cat-water-fountain"),
      p("filtered-water-fountain-2-5l-ck-006", "/products/pet-cat-dog-stainless-steel-automatic-circulation-water-disp-146240"),
      p("lick-mat-slow-feeder-ck-002", "/products/dog-puzzle-feeder-toy"),
      p("self-cleaning-slicker-brush-ck-003", "/products/self-cleaning-slicker-brush-for-dogs-cats-pets-one-click-cle-025856"),
      p("interactive-feather-wand-for-cats-ck-004", "/products/cat-teaser-stick-retractable-cat-wand-with-replacement-head--156352"),
      p("self-warming-calming-donut-bed-ck-001", "/products/calming-dog-bed"),
      p("no-pull-reflective-harness-ck-005", "/category/walking"),
      ...Object.entries(slugRenames).map(([from, to]) => p(from, `/products/${to}`)),
    ];
  },
};
export default nextConfig;
