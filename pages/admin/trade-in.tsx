import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { requireAdminPage } from "../../lib/adminAuth";
import AdminLayout from "../../components/admin/AdminLayout";
import Spinner from "../../components/Spinner";
import { TradeinRequest } from "../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

const STATUS_COLORS: Record<TradeinRequest['status'], string> = {
  pending: "bg-amber-100 text-amber-700",
  reviewed: "bg-blue-100 text-blue-700",
  accepted: "bg-teal-100 text-teal-700",
  rejected: "bg-rose-100 text-rose-700",
};

const AdminTradein: NextPage = () => {
  const [requests, setRequests] = useState<TradeinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TradeinRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [status, setStatus] = useState<TradeinRequest['status']>("pending");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/trade-in");
    const data = await res.json();
    setRequests(data.requests ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDetail = (r: TradeinRequest) => {
    setSelected(r);
    setStatus(r.status);
    setAdminNote(r.adminNote ?? "");
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/trade-in/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote: adminNote || null }),
    });
    setSaving(false);
    setSelected(null);
    load();
  };

  return (
    <>
      <Head><title>Admin | Trade-in</title></Head>
      <AdminLayout>
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Trade-in Requests</h1>

          {/* Detail modal */}
          {selected && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4">{selected.customerName}</h2>
                <dl className="text-sm space-y-2 text-gray-700">
                  <div><dt className="font-medium inline">Device: </dt><dd className="inline">{selected.deviceName}</dd></div>
                  <div><dt className="font-medium inline">Condition: </dt><dd className="inline capitalize">{selected.deviceCondition}</dd></div>
                  <div><dt className="font-medium inline">Phone: </dt><dd className="inline">{selected.phone}</dd></div>
                  {selected.email && <div><dt className="font-medium inline">Email: </dt><dd className="inline">{selected.email}</dd></div>}
                  {selected.notes && <div><dt className="font-medium inline">Notes: </dt><dd className="inline">{selected.notes}</dd></div>}
                </dl>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as TradeinRequest['status'])} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                      {(["pending","reviewed","accepted","rejected"] as TradeinRequest['status'][]).map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin note</label>
                    <textarea rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setSelected(null)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
                    <button onClick={save} disabled={saving} className="bg-slate-800 text-white text-sm rounded-md px-4 py-2 disabled:opacity-50">Save</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : requests.length === 0 ? (
            <p className="text-gray-500">No requests yet.</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Device</th>
                    <th className="px-4 py-3">Condition</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.customerName}</td>
                      <td className="px-4 py-3 text-gray-600">{r.deviceName}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{r.deviceCondition}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[r.status]}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => openDetail(r)} className="text-xs text-blue-600 hover:underline">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminTradein;
