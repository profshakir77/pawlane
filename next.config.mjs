/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // Old demo product pages (linked from early social posts) now point to the
  // real products that replaced them.
  async redirects() {
    const p = (from, to) => ({ source: `/products/${from}`, destination: to, permanent: true });
    return [
      p("filtered-water-fountain-2-5l-ck-006", "/products/pet-cat-dog-stainless-steel-automatic-circulation-water-disp-146240"),
      p("lick-mat-slow-feeder-ck-002", "/products/dog-pets-puzzle-toys-slow-feeder-interactive-increase-puppy--011392"),
      p("self-cleaning-slicker-brush-ck-003", "/products/self-cleaning-slicker-brush-for-dogs-cats-pets-one-click-cle-025856"),
      p("interactive-feather-wand-for-cats-ck-004", "/products/cat-teaser-stick-retractable-cat-wand-with-replacement-head--156352"),
      p("self-warming-calming-donut-bed-ck-001", "/products/dog-bed-538496"),
      p("no-pull-reflective-harness-ck-005", "/category/walking"),
    ];
  },
};
export default nextConfig;
