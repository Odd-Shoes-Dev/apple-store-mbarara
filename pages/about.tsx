import type { NextPage } from "next";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import FeatureGrid, { FeatureItem } from "../components/FeatureGrid";
import CtaBanner from "../components/CtaBanner";

const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const values: FeatureItem[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: "100% Authentic",
    text: "Every device we sell is genuine, sealed, and backed by a real warranty.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: "Fair pricing",
    text: "Competitive prices on every product, with no hidden costs.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    title: "Local & convenient",
    text: "Right in Mbarara, just five minutes from the main taxi park.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Dedicated support",
    text: "Real answers on WhatsApp and by phone — before and after you buy.",
  },
];

const AboutPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>About — Apple Store Mbarara</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />

      <PageHero
        eyebrow="About"
        title="Genuine Apple, the Mbarara way."
        subtitle="We started with one promise: every device we hand you is exactly what it says on the box — sealed, verifiable, and backed by a real warranty."
        pills={["Genuine & Sealed", "Warranty Included", "Local & Trusted"]}
      />

      <section className="py-14 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 lg:px-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">What we stand for</h2>
          <FeatureGrid items={values} />
        </div>
      </section>

      <CtaBanner
        title="Your next Apple device, today."
        subtitle="Browse the store or message us directly — we're happy to help you choose."
        primaryLabel="Shop now"
        primaryHref="/store"
        whatsappNumber={waNumber}
        whatsappMessage="Hi, I have a question about Apple Store Mbarara."
      />

      <Footer />
    </>
  );
};

export default AboutPage;
