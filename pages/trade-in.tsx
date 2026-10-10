import type { NextPage } from "next";
import { useState, FormEvent } from "react";
import Header from "../components/Header";
import PageHero from "../components/PageHero";
import SeoHead from "../components/SeoHead";

const TradeInPage: NextPage = () => {
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    deviceName: "",
    deviceCondition: "good" as "good" | "fair" | "poor",
    notes: "",
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
    const res = await fetch("/api/trade-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, email: form.email || null, notes: form.notes || null }),
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
        title="Trade-in — Apple Store Mbarara"
        description="Trade in your old Apple device for credit toward your next purchase at Apple Store Mbarara."
        image="/logo.png"
      />
      <Header />

      <PageHero
        eyebrow="Trade-in"
        title="Turn your old device into credit."
        subtitle="Swap your old iPhone, Mac, iPad or Watch toward something new. We review every request and get back to you with an offer."
        pills={["Free inspection", "Fair value", "Fast response"]}
      />

      <main className="min-h-screen bg-gray-50 py-16 px-4">
        <div className="max-w-lg mx-auto">
          {done ? (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-8 text-center">
              <svg className="w-12 h-12 text-teal-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-semibold text-teal-800 mb-2">Request submitted!</h2>
              <p className="text-teal-700">We will review your request and contact you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-8 space-y-5">
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Device (e.g. iPhone 13 Pro 256GB)</label>
                <input required value={form.deviceName} onChange={set("deviceName")} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Device condition</label>
                <select value={form.deviceCondition} onChange={set("deviceCondition")} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="good">Good — works perfectly, minor scratches</option>
                  <option value="fair">Fair — some wear, fully functional</option>
                  <option value="poor">Poor — heavy wear or minor faults</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Additional notes (optional)</label>
                <textarea rows={3} value={form.notes} onChange={set("notes")} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Any extra info about the device..." />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white rounded-full py-3 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit trade-in request"}
              </button>
            </form>
          )}
        </div>
      </main>
    </>
  );
};

export default TradeInPage;
