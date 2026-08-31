import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import { getCatalogService, getCategoryService } from "../server/config/services";
import { CategoryWithChildren, Product } from "../server/domain/types";

type DepartmentSection = {
  department: CategoryWithChildren;
  products: Product[];
};

type Props = {
  navTree: CategoryWithChildren[];
  sections: DepartmentSection[];
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const categoryService = getCategoryService();
  const [navTree, featuredProducts] = await Promise.all([
    categoryService.getNavTree(),
    getCatalogService().listFeaturedProducts(),
  ]);

  const filteredTree = navTree.filter((d) => d.slug !== "other");

  const sections: DepartmentSection[] = filteredTree
    .map((dept) => {
      const deptCategoryIds = new Set([dept.id, ...dept.children.map((c) => c.id)]);
      const products = featuredProducts.filter(
        (p) => p.category && deptCategoryIds.has(p.category.id)
      );
      return { department: dept, products };
    })
    .filter(({ products }) => products.length > 0);

  return {
    props: {
      navTree: JSON.parse(JSON.stringify(filteredTree)),
      sections: JSON.parse(JSON.stringify(sections)),
    },
  };
};

/* ─── CSS device renders ─────────────────────────────────────────── */

function IPhoneRender() {
  return (
    <div
      style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(-50%, -50%)", zIndex: 3,
        width: 200, height: 410,
        borderRadius: 48,
        background: "linear-gradient(135deg, #3a3a3d 0%, #161618 45%, #050506 100%)",
        boxShadow: "0 60px 100px -30px rgba(0,0,0,0.7), inset 0 0 0 2px rgba(255,255,255,0.06)",
      }}
    >
      <div style={{
        position: "absolute", inset: 5, borderRadius: 43,
        background: "radial-gradient(120% 90% at 30% 10%, #2b2b2e, #050505 60%)",
      }} />
      <div style={{
        position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
        width: 76, height: 20, borderRadius: 18, background: "#000",
      }} />
    </div>
  );
}

function MacRender() {
  return (
    <div style={{
      position: "absolute", left: "50%", bottom: "4%",
      transform: "translateX(-50%)", zIndex: 1,
      width: "76%", maxWidth: 520,
    }}>
      <div style={{
        width: "100%", paddingBottom: "62%", position: "relative",
        borderRadius: "14px 14px 0 0",
        background: "linear-gradient(160deg, #242427 0%, #0a0a0b 70%)",
        boxShadow: "0 40px 90px -30px rgba(0,0,0,0.65)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <div style={{
          position: "absolute", inset: 0, borderRadius: "14px 14px 0 0",
          background: "radial-gradient(80% 60% at 30% 0%, rgba(201,161,90,0.16), transparent 60%)",
        }} />
      </div>
      <div style={{
        width: "112%", height: 13, marginLeft: "-6%",
        background: "linear-gradient(180deg, #d7d7db, #a8a8ad)",
        borderRadius: "0 0 10px 10px",
      }} />
    </div>
  );
}

function WatchRender() {
  return (
    <div style={{
      position: "absolute", right: "6%", top: "12%", zIndex: 4,
      width: 84, height: 104,
      borderRadius: 30,
      background: "linear-gradient(150deg, #2a2a2c, #0c0c0d)",
      boxShadow: "0 30px 60px -20px rgba(0,0,0,0.6), inset 0 0 0 2px rgba(255,255,255,0.05)",
    }}>
      <div style={{
        position: "absolute", inset: 7, borderRadius: 23,
        background: "radial-gradient(100% 80% at 30% 10%, #33291a, #000 65%)",
      }} />
      <div style={{
        position: "absolute", right: -4, top: 28,
        width: 8, height: 14,
        background: "linear-gradient(180deg, #b8b8bd, #87878d)",
        borderRadius: 3,
      }} />
    </div>
  );
}

/* ─── Trust cards ─────────────────────────────────────────────────── */

const trustItems = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
      </svg>
    ),
    title: "Genuine Products",
    desc: "Every device sourced through official channels — never grey-market.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M21 8v13H3V8M1 3h22l-3 5H4L1 3z" />
      </svg>
    ),
    title: "Free Local Delivery",
    desc: "Same-day within Mbarara town, next-day across the region.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
      </svg>
    ),
    title: "Trade-in Program",
    desc: "Get credit toward a new device when you trade in your old one.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    title: "WhatsApp Support",
    desc: "Chat with our team before you buy — fast, friendly, no pressure.",
    green: true,
  },
];

/* ─── Page ────────────────────────────────────────────────────────── */

const LandingPage: NextPage<Props> = ({ navTree, sections }) => {
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <>
      <Head>
        <title>Apple Store Mbarara</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header navTree={navTree} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center text-center text-white overflow-hidden px-5 pt-20 pb-14"
        style={{
          background: "radial-gradient(120% 100% at 50% 0%, #1c1c1e 0%, #000 55%)",
          minHeight: "88vh",
        }}
      >
        <p className="text-sm font-semibold tracking-wide" style={{ color: "#86868b" }}>
          Apple Store Mbarara
        </p>
        <h1
          className="mt-2 font-bold leading-tight"
          style={{
            fontSize: "clamp(2.4rem, 7vw, 5rem)",
            letterSpacing: "-0.03em",
            background: "linear-gradient(180deg, #fff 0%, #d8d8dc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Genuine Apple.<br />Now in Mbarara.
        </h1>
        <p
          className="mt-4 font-medium max-w-md"
          style={{ fontSize: "clamp(1rem, 2vw, 1.3rem)", color: "#c7c7cc" }}
        >
          Authorized, affordable, and 5&nbsp;minutes from the taxi park.
        </p>
        <div className="flex gap-3 mt-8 flex-wrap justify-center">
          <Link href="/store" passHref>
            <a
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-85"
              style={{ background: "#0071e3" }}
            >
              Shop now
            </a>
          </Link>
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-colors"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              Ask a Specialist
            </a>
          )}
        </div>

        {/* Device render */}
        <div
          className="relative mx-auto mt-14"
          style={{ width: "min(680px, 90vw)", aspectRatio: "16/10" }}
        >
          {/* Gold glow */}
          <div style={{
            position: "absolute", inset: "-20%",
            background: "radial-gradient(closest-side, rgba(201,161,90,0.2), transparent 70%)",
            filter: "blur(40px)",
          }} />
          <WatchRender />
          <IPhoneRender />
          <MacRender />
        </div>
      </section>

      {/* ── FEATURED PRODUCTS BY DEPARTMENT ──────────────────────── */}
      {sections.length > 0 && (
        <div className="bg-white">
          {sections.map(({ department, products }, i) => (
            <section
              key={department.id}
              className={`py-16 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
            >
              <div className="max-w-5xl mx-auto px-5 lg:px-0">
                <div className="flex items-baseline justify-between mb-8">
                  <h2
                    className="text-2xl font-bold text-gray-900"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {department.name}
                  </h2>
                  <Link href={{ pathname: "/store", query: { category: department.slug } }} passHref>
                    <a className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      Browse all {department.name} →
                    </a>
                  </Link>
                </div>
                <div className="grid justify-items-center grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-y-10 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
                  {products.slice(0, 3).map((p) => (
                    <ProductCard product={p} key={p.id} />
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}

      {sections.length === 0 && (
        <section className="py-24 text-center bg-white">
          <p className="text-gray-500 text-sm">
            No featured products yet.{" "}
            <Link href="/store" passHref>
              <a className="text-blue-600 hover:underline">Browse the full store →</a>
            </Link>
          </p>
        </section>
      )}

      {/* ── TRUST CARDS ───────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-5 lg:px-0">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: "-0.02em" }}>
              Why buy from us
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Everything a big-city Apple store offers — now local.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                  style={{
                    background: item.green ? "#25D366" : "#f5f5f7",
                    color: item.green ? "white" : "#1d1d1f",
                  }}
                >
                  {item.icon}
                </div>
                <h4 className="font-semibold text-gray-900 text-base">{item.title}</h4>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FIND US ───────────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-5 lg:px-0">
          <div
            className="overflow-hidden rounded-3xl grid grid-cols-1 sm:grid-cols-2"
            style={{ background: "#000" }}
          >
            {/* Info */}
            <div className="flex flex-col justify-center px-10 py-14 text-white">
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#c9a15a" }}>
                Find us
              </p>
              <h3
                className="mt-3 text-3xl font-bold"
                style={{ letterSpacing: "-0.02em" }}
              >
                Apple Store Mbarara
              </h3>
              <p className="mt-4 text-sm leading-relaxed" style={{ color: "#a1a1a6" }}>
                On High Street in the town centre — easy parking, five minutes from the main taxi park.
              </p>

              <div className="mt-8 flex flex-col gap-5">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a15a" strokeWidth="1.6" className="mt-0.5 flex-shrink-0">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  <div>
                    <span className="block text-xs" style={{ color: "#8b8b90" }}>Address</span>
                    <strong className="text-sm font-medium text-white">High Street, Mbarara, Uganda</strong>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a15a" strokeWidth="1.6" className="mt-0.5 flex-shrink-0">
                    <path d="M3 5a2 2 0 012-2h3l2 5-2 1a11 11 0 006 6l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 5z" />
                  </svg>
                  <div>
                    <span className="block text-xs" style={{ color: "#8b8b90" }}>Phone / WhatsApp</span>
                    <strong className="text-sm font-medium text-white">+256 780 526 527</strong>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-4">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c9a15a" strokeWidth="1.6" className="mt-0.5 flex-shrink-0">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                  <div>
                    <span className="block text-xs" style={{ color: "#8b8b90" }}>Hours</span>
                    <strong className="text-sm font-medium text-white">Mon – Sat, 9:00 – 19:00</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps embed */}
            <div className="relative min-h-72 sm:min-h-0">
              <iframe
                title="Apple Store Mbarara location"
                src="https://maps.google.com/maps?q=High+Street+Mbarara+Uganda&output=embed&z=15"
                width="100%"
                height="100%"
                style={{ border: 0, display: "block", minHeight: 300 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPage;
