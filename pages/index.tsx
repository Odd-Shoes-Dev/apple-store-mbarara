import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import { useState, FormEvent } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
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

/* ─── TypeScript declaration for model-viewer web component ─────── */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        "auto-rotate"?: boolean | string;
        "camera-controls"?: boolean | string;
        "shadow-intensity"?: string;
        "rotation-per-second"?: string;
        "camera-orbit"?: string;
        exposure?: string;
        ar?: boolean | string;
      };
    }
  }
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
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "loading" | "done" | "error">("idle");

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    setSubState("loading");
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSubState(res.ok ? "done" : "error");
  };

  return (
    <>
      <Head>
        <title>Apple Store Mbarara</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js"
        strategy="lazyOnload"
      />

      <Header navTree={navTree} />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center text-center text-white overflow-hidden px-5 pt-20 pb-14"
        style={{
          background: "radial-gradient(120% 100% at 50% 0%, #1c1c1e 0%, #000 55%)",
          minHeight: "88vh",
        }}
      >
        {/* 3D model — absolutely left, only visible on large screens */}
        <div className="absolute inset-y-0 left-0 w-[42%] hidden lg:flex items-center justify-center">
          {/* Gold glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(closest-side, rgba(201,161,90,0.15), transparent 70%)",
            filter: "blur(40px)",
            pointerEvents: "none",
          }} />
          {/* @ts-ignore */}
          <model-viewer
            src="/3d-assets/iphone_17_pro.glb"
            alt="iPhone 17 Pro"
            auto-rotate
            camera-controls
            rotation-per-second="30deg"
            shadow-intensity="0.8"
            exposure="0.9"
            camera-orbit="0deg 75deg 2.5m"
            style={{ width: "100%", height: "100%", background: "transparent" }}
          />
        </div>

        {/* Text — centered, full width, z-10 so it sits above the model */}
        <div className="relative z-10 flex flex-col items-center">
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
                className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-85"
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
                className="inline-flex items-center px-6 py-3 rounded-full text-sm font-semibold transition-colors"
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
              <div className="max-w-5xl mx-auto">
                <div className="flex items-baseline justify-between mb-6 px-5 lg:px-0">
                  <h2
                    className="text-2xl font-bold text-gray-900"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {department.name}
                  </h2>
                  <Link href={{ pathname: "/store", query: { category: department.slug } }} passHref>
                    <a className="text-sm font-medium text-blue-600 hover:text-blue-700 flex-shrink-0">
                      Browse all →
                    </a>
                  </Link>
                </div>
                {/* Horizontal scroll row */}
                <div className="flex gap-4 overflow-x-auto pb-4 px-5 lg:px-0 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: "none" }}>
                  {products.map((p) => (
                    <div key={p.id} className="flex-none w-56 snap-start">
                      <ProductCard product={p} />
                    </div>
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

      {/* ── TRADE-IN CTA ──────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto px-5 lg:px-0">
          <div className="rounded-3xl overflow-hidden flex flex-col sm:flex-row items-center gap-0" style={{ background: "linear-gradient(135deg,#1d1d1f 0%,#3a3a3c 100%)" }}>
            <div className="flex-1 px-10 py-14">
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#c9a15a" }}>Trade-in</p>
              <h2 className="text-3xl font-bold text-white mb-4" style={{ letterSpacing: "-0.02em" }}>Swap your old device</h2>
              <p className="text-sm leading-relaxed mb-8" style={{ color: "#a1a1a6" }}>
                Get a fair price for your old iPhone, Mac, or iPad — and put it towards something new.
                We assess every device and give you a quote same-day.
              </p>
              <Link href="/trade-in" passHref>
                <a className="inline-block bg-white text-gray-900 text-sm font-semibold rounded-full px-7 py-3 hover:bg-gray-100 transition-colors">
                  Get a trade-in quote
                </a>
              </Link>
            </div>
            <div className="flex-shrink-0 px-10 py-10 hidden sm:flex items-center justify-center">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <rect x="30" y="10" width="40" height="70" rx="6" fill="#3a3a3c" stroke="#c9a15a" strokeWidth="2"/>
                <rect x="45" y="75" width="10" height="5" rx="2" fill="#c9a15a"/>
                <path d="M60 55 L85 30 L95 40 L70 65 Z" fill="#c9a15a" opacity="0.8"/>
                <path d="M85 25 L100 10 L110 20 L95 35 Z" fill="#c9a15a"/>
                <path d="M60 65 L55 80 L70 75 Z" fill="#c9a15a" opacity="0.6"/>
              </svg>
            </div>
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
      {/* ── NEWSLETTER ───────────────────────────────────────────── */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-lg mx-auto px-5 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.02em" }}>
            Stay in the loop
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            Get notified about new arrivals, deals, and store events.
          </p>
          {subState === "done" ? (
            <p className="text-teal-600 font-medium text-sm">You are subscribed!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-3 max-w-sm mx-auto">
              <input
                required
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border border-gray-300 rounded-full px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                disabled={subState === "loading"}
                className="bg-black text-white text-sm font-semibold rounded-full px-6 py-2.5 hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {subState === "loading" ? "..." : "Subscribe"}
              </button>
            </form>
          )}
          {subState === "error" && <p className="text-rose-500 text-xs mt-2">Something went wrong. Try again.</p>}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default LandingPage;
