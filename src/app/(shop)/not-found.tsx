import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-28 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 text-5xl sm:text-6xl">This page wandered off</h1>
      <p className="mx-auto mt-5 max-w-md text-ink/65">
        The link may be old, or the product is no longer available. Everything we currently carry is one click away.
      </p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Link href="/#shop" className="btn-primary">Shop the collection</Link>
        <Link href="/" className="btn-ghost">Back to home</Link>
      </div>
    </div>
  );
}
