import type { NextPage } from "next";
import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageHero from "../components/PageHero";
import FeatureGrid, { FeatureItem } from "../components/FeatureGrid";
import FaqAccordion, { FaqItem } from "../components/FaqAccordion";
import CtaBanner from "../components/CtaBanner";

const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const options: FeatureItem[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 12h18M12 3v18" />
      </svg>
    ),
    title: "Same-day Mbarara delivery",
    text: "Order early in the day and it's with you before closing time, right here in Mbarara.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="7" width="13" height="10" rx="1" />
        <path d="M16 10h3l2 3v4h-5" />
        <circle cx="7" cy="19" r="1.5" />
        <circle cx="17" cy="19" r="1.5" />
      </svg>
    ),
    title: "Nationwide delivery",
    text: "We deliver across Uganda via trusted couriers. Message us your area for a delivery estimate.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 9l9-6 9 6-9 6-9-6z" />
        <path d="M3 9v6l9 6 9-6V9" />
      </svg>
    ),
    title: "In-store pickup",
    text: "Collect your order the same day from our store. Call ahead to confirm it's ready.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: "Mobile money or cash",
    text: "Pay with MTN MoMo, Airtel Money, bank transfer, or cash on delivery — whichever suits you.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
      </svg>
    ),
    title: "Packed with care",
    text: "Every order is carefully packed before it leaves our store.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
    title: "Order updates on WhatsApp",
    text: "We keep you posted on your order's status so you always know when it's arriving.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "How much does delivery cost?",
    answer: "It depends on your location and order size. Message us on WhatsApp with your area and we'll confirm the exact fee before you order.",
  },
  {
    question: "Can I pay cash when it arrives?",
    answer: "Yes, cash on delivery is available within Mbarara. For other areas, we confirm the payment option when you order.",
  },
  {
    question: "How do I track my delivery?",
    answer: "Once your order ships, we'll update you on WhatsApp so you can check the status anytime.",
  },
  {
    question: "What if I'm not around when it arrives?",
    answer: "Message us as soon as you know and we'll arrange a new time or a pickup point.",
  },
];

const DeliveryPage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Delivery — Apple Store Mbarara</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Header />

      <PageHero
        eyebrow="Delivery"
        title="Getting it to you."
        subtitle="Whichever way suits you — in Mbarara or beyond."
        pills={["Tracked", "Pay on delivery", "Mobile money accepted"]}
      />

      <section className="py-14 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 lg:px-0">
          <FeatureGrid items={options} />
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="max-w-2xl mx-auto px-5 lg:px-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Good questions</h2>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      <CtaBanner
        title="Ready to order?"
        subtitle="Browse the store or message us directly to place your order."
        primaryLabel="Shop now"
        primaryHref="/store"
        whatsappNumber={waNumber}
        whatsappMessage="Hi, I'd like to place an order."
      />

      <Footer />
    </>
  );
};

export default DeliveryPage;
