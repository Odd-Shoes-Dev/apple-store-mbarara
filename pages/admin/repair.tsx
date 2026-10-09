import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { requireAdminPage } from "../../lib/adminAuth";
import AdminLayout from "../../components/admin/AdminLayout";
import Spinner from "../../components/Spinner";
import { RepairRequest } from "../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

const STATUS_COLORS: Record<RepairRequest['status'], string> = {
  pending: "bg-amber-100 text-amber-700",
  reviewed: "bg-blue-100 text-blue-700",
  quoted: "bg-purple-100 text-purple-700",
  completed: "bg-teal-100 text-teal-700",
};

const DEVICE_TYPE_LABELS: Record<string, string> = {
  iphone: "iPhone",
  macbook: "MacBook",
  ipad: "iPad",
  apple_watch: "Apple Watch",
};

const AdminRepair: NextPage = () => {
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<RepairRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [status, setStatus] = useState<RepairRequest['status']>("pending");
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/repair");
    const data = await res.json();
    setRequests(data.requests ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openDetail = (r: RepairRequest) => {
    setSelected(r);
    setStatus(r.status);
    setAdminNote(r.adminNote ?? "");
  };

  const save = async () => {
    if (!selected) return;
    setSaving(true);
    await fetch(`/api/admin/repair/${selected.id}`, {
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
      <Head><title>Admin | Repair Requests</title></Head>
      <AdminLayout>
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Repair Requests</h1>

          {selected && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-lg font-semibold mb-4">{selected.customerName}</h2>
                <dl className="text-sm space-y-2 text-gray-700">
                  <div><dt className="font-medium inline">Device: </dt><dd className="inline">{selected.deviceName} ({DEVICE_TYPE_LABELS[selected.deviceType] ?? selected.deviceType})</dd></div>
                  <div><dt className="font-medium inline">Issue: </dt><dd className="inline">{selected.issueDescription}</dd></div>
                  <div><dt className="font-medium inline">Phone: </dt><dd className="inline">{selected.phone}</dd></div>
                  {selected.email && <div><dt className="font-medium inline">Email: </dt><dd className="inline">{selected.email}</dd></div>}
                </dl>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value as RepairRequest['status'])} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                      {(["pending","reviewed","quoted","completed"] as RepairRequest['status'][]).map((s) => (
                        <option key={s} value={s} className="capitalize">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin note</label>
                    <textarea rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. quoted price, parts needed..." />
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
                    <th className="px-4 py-3">Issue</th>
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
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.issueDescription}</td>
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

export default AdminRepair;
