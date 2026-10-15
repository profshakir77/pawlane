import Link from "next/link";

const NAV = [
  ["/admin", "Overview"], ["/admin/orders", "Orders"], ["/admin/products", "Products"], ["/admin/import", "Find products"],
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-ink p-5 text-paper md:w-56 md:shrink-0">
        <p className="font-display text-xl font-extrabold">Admin</p>
        <nav className="mt-6 flex gap-4 overflow-x-auto text-sm md:flex-col md:gap-2">
          {NAV.map(([href, label]) => <Link key={href} href={href} className="whitespace-nowrap rounded-lg py-1 hover:text-biscuit">{label}</Link>)}
          <Link href="/" className="whitespace-nowrap py-1 hover:text-biscuit">View store</Link>
        </nav>
        <form action="/api/admin/logout" method="post" className="mt-6">
          <button className="text-sm text-paper/70 hover:text-paper">Sign out</button>
        </form>
      </aside>
      <div className="flex-1 overflow-x-auto p-5 md:p-10">{children}</div>
    </div>
  );
}
