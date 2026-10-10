import type { NextPage } from "next";
import SeoHead from "../components/SeoHead";
import { useState, FormEvent } from "react";
import Header from "../components/Header";
import PageHero from "../components/PageHero";
import FeatureGrid, { FeatureItem } from "../components/FeatureGrid";
import FaqAccordion, { FaqItem } from "../components/FaqAccordion";
import CtaBanner from "../components/CtaBanner";

const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

const features: FeatureItem[] = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: "Free diagnostics",
    text: "We check the issue before quoting anything, so you know exactly what's wrong first.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
    title: "Fast turnaround",
    text: "Most common repairs are done same-day, so you're not without your device for long.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: "Genuine / OEM parts",
    text: "We use original or clearly disclosed OEM-grade parts — never anything hidden.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "Is my data safe during a repair?",
    answer: "Screen, battery and camera repairs don't require wiping your device. For anything involving the logic board or software, we explain everything before starting.",
  },
  {
    question: "Do I need an appointment?",
    answer: "No — message us on WhatsApp with your device and issue, and we'll confirm whether the part is in stock before you bring it in.",
  },
  {
    question: "How long does a repair take?",
    answer: "It depends on the device and issue. We'll give you a time estimate as part of your quote.",
  },
  {
    question: "What if my device won't turn on?",
    answer: "Bring it in anyway — free diagnostics cover this too, and we'll tell you the cause before quoting anything.",
  },
];

const DEVICE_TYPES = [
  { value: "iphone", label: "iPhone" },
  { value: "macbook", label: "MacBook" },
  { value: "ipad", label: "iPad" },
  { value: "apple_watch", label: "Apple Watch" },
];

const RepairPage: NextPage = () => {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    deviceName: "",
    deviceType: "iphone",
    issueDescription: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const res = await fetch("/api/repair", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, email: form.email || null }),
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Failed to submit request");
      return;
    }
    setDone(true);
  };

  return (
    <>
      <SeoHead
        title="Repair — Apple Store Mbarara"
        description="Book a repair for your Apple device — screens, batteries, and more, serviced in Mbarara."
        image="/logo.png"
      />
      <Header />

      <PageHero
        eyebrow="Repair"
        title="Expert Apple repairs, done right."
        subtitle="Cracked screen, dead battery, or something else — tell us what's wrong and we'll get back to you with a quote."
        pills={["Free diagnostics", "Genuine / OEM parts", "Fast turnaround"]}
      />

      <section className="py-14 bg-gray-50">
        <div className="max-w-5xl mx-auto px-5 lg:px-0">
          <FeatureGrid items={features} />
        </div>
      </section>

      <section id="repair-form" className="py-14 bg-white">
        <div className="max-w-lg mx-auto px-5 lg:px-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Request a repair quote</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tell us about your device and the issue — we&apos;ll review it and reply with a quote.
          </p>

          {done ? (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-8 text-center">
              <svg className="w-12 h-12 text-teal-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-teal-800 mb-2">Request submitted!</h3>
              <p className="text-teal-700">We&apos;ll review your request and get back to you with a quote soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8 space-y-5 border border-gray-200">
              {error && <p className="text-sm text-rose-600">{error}</p>}

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Your name</label>
                  <input required value={form.customerName} onChange={set("customerName")} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Phone number</label>
                  <input required type="tel" value={form.phone} onChange={set("phone")} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
                <input type="email" value={form.email} onChange={set("email")} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Device type</label>
                  <select value={form.deviceType} onChange={set("deviceType")} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                    {DEVICE_TYPES.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Model (e.g. iPhone 13 Pro)</label>
                  <input required value={form.deviceName} onChange={set("deviceName")} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">What&apos;s wrong?</label>
                <textarea required rows={3} value={form.issueDescription} onChange={set("issueDescription")} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. Cracked screen, battery drains fast, won't charge..." />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white rounded-full py-3 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit repair request"}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="py-14 bg-gray-50">
        <div className="max-w-2xl mx-auto px-5 lg:px-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Good questions</h2>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      <CtaBanner
        title="Cracked? Dead battery? Bring it in."
        subtitle="Message us on WhatsApp and we'll tell you what it'll take to fix it."
        primaryLabel="Request a quote"
        primaryHref="#repair-form"
        whatsappNumber={waNumber}
        whatsappMessage="Hi, I'd like a repair quote for my device."
      />
    </>
  );
};

export default RepairPage;
