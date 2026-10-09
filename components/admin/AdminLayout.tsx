import { ReactNode, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import Logo from "../../public/logo.png";

const icon = (path: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    {path}
  </svg>
);

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: icon(<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: icon(<><path d="M21 8v13H3V8M1 3h22l-3 5H4L1 3z" /></>),
  },
  {
    label: "Categories",
    href: "/admin/categories",
    icon: icon(<><path d="M20.59 13.41L13 21l-9-9V3h9l9 9a2 2 0 010 1.41z" /><circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" /></>),
  },
  {
    label: "Hero",
    href: "/admin/hero",
    icon: icon(<><rect x="3" y="4" width="18" height="14" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="M21 15l-5-5-9 9" /></>),
  },
  {
    label: "Store Gallery",
    href: "/admin/store-gallery",
    icon: icon(<><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></>),
  },
  {
    label: "Reviews",
    href: "/admin/reviews",
    icon: icon(<><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" /></>),
  },
  {
    label: "Trade-in",
    href: "/admin/trade-in",
    icon: icon(<><path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" /></>),
  },
  {
    label: "Repair",
    href: "/admin/repair",
    icon: icon(<><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></>),
  },
  {
    label: "Subscribers",
    href: "/admin/subscribers",
    icon: icon(<><path d="M4 4h16v16H4z" opacity="0" /><path d="M22 6l-10 7L2 6" /><rect x="2" y="4" width="20" height="16" rx="2" /></>),
  },
];

function isItemActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

const SidebarContent = ({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) => (
  <>
    <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-200 flex-shrink-0">
      <Link href="/admin" passHref>
        <a onClick={onNavigate} className="flex items-center gap-2">
          <Image src={Logo} width={84} height={30} alt="Apple Store Mbarara" />
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Admin</span>
        </a>
      </Link>
    </div>
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = isItemActive(pathname, item.href);
        return (
          <Link key={item.href} href={item.href} passHref>
            <a
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? "bg-slate-800 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {item.icon}
              {item.label}
            </a>
          </Link>
        );
      })}
    </nav>
    <div className="p-3 border-t border-gray-200 flex-shrink-0">
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
      >
        {icon(<><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>)}
        Sign out
      </button>
    </div>
  </>
);

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <Link href="/admin" passHref>
          <a className="flex items-center gap-2">
            <Image src={Logo} width={76} height={27} alt="Apple Store Mbarara" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Admin</span>
          </a>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -mr-2 text-gray-600"
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="14" y2="17" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[80%] h-full bg-white flex flex-col shadow-xl">
            <SidebarContent pathname={router.pathname} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:flex-shrink-0 bg-white border-r border-gray-200 lg:sticky lg:top-0 lg:h-screen">
        <SidebarContent pathname={router.pathname} />
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
};

export default AdminLayout;
