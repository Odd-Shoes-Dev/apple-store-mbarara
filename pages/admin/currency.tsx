import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { requireAdminPage } from "../../lib/adminAuth";
import AdminLayout from "../../components/admin/AdminLayout";
import Spinner from "../../components/Spinner";
import { ExchangeRateMode, ExchangeRateSettings } from "../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

const AdminCurrency: NextPage = () => {
  const [settings, setSettings] = useState<ExchangeRateSettings | null>(null);
  const [liveRate, setLiveRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<ExchangeRateMode>("live");
  const [manualRate, setManualRate] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/exchange-rate");
    const data = await res.json();
    setSettings(data.settings);
    setLiveRate(data.liveRate);
    setMode(data.settings.mode);
    setManualRate(data.settings.manualRate ? String(data.settings.manualRate) : "");
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setError(null);
    setSaved(false);

    if (mode === "manual") {
      const parsed = parseFloat(manualRate);
      if (!manualRate || Number.isNaN(parsed) || parsed <= 0) {
        setError("Enter a valid manual rate (UGX per 1 USD)");
        return;
      }
    }

    setSaving(true);
    const res = await fetch("/api/admin/exchange-rate", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        manualRate: mode === "manual" ? parseFloat(manualRate) : undefined,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      setError("Failed to save");
      return;
    }
    setSaved(true);
    load();
  };

  return (
    <>
      <Head><title>Admin | Currency</title></Head>
      <AdminLayout>
        <main className="max-w-2xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Currency</h1>
          <p className="text-sm text-gray-500 mb-8">
            Controls the UGX ⇄ USD rate used whenever a visitor switches their display currency.
            Nothing here changes how individual products are priced.
          </p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Current live rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {liveRate ? `1 USD = ${liveRate.toLocaleString(undefined, { maximumFractionDigits: 2 })} UGX` : "Unavailable"}
                  </p>
                </div>
                <button onClick={load} className="text-sm font-medium text-blue-600 hover:underline">
                  Refresh
                </button>
              </div>

              {settings?.cachedLiveRateFetchedAt && (
                <p className="text-xs text-gray-400 -mt-3">
                  Cached rate last updated {new Date(settings.cachedLiveRateFetchedAt).toLocaleString()}
                </p>
              )}

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer has-[:checked]:border-slate-800 has-[:checked]:bg-slate-50">
                  <input type="radio" checked={mode === "live"} onChange={() => setMode("live")} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Use live rate</p>
                    <p className="text-xs text-gray-500">Automatically updated from a live exchange rate source, cached for a few hours.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer has-[:checked]:border-slate-800 has-[:checked]:bg-slate-50">
                  <input type="radio" checked={mode === "manual"} onChange={() => setMode("manual")} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Set my own rate</p>
                    <p className="text-xs text-gray-500 mb-2">You control exactly what rate is used, regardless of the live market rate.</p>
                    {mode === "manual" && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-gray-500">1 USD =</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={manualRate}
                          onChange={(e) => setManualRate(e.target.value)}
                          placeholder="e.g. 3800"
                          className="w-32 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                        />
                        <span className="text-sm text-gray-500">UGX</span>
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {error && <p className="text-sm text-rose-600">{error}</p>}
              {saved && <p className="text-sm text-teal-600">Saved.</p>}

              <button
                onClick={save}
                disabled={saving}
                className="bg-slate-800 text-white text-sm font-medium rounded-md px-5 py-2.5 hover:bg-slate-900 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </main>
      </AdminLayout>
    </>
  );
};

export default AdminCurrency;
