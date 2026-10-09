import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { requireAdminPage } from "../../lib/adminAuth";
import AdminLayout from "../../components/admin/AdminLayout";
import Spinner from "../../components/Spinner";
import { Review } from "../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

const stars = (rating: number) =>
  Array.from({ length: 5 }, (_, i) => (i < rating ? "★" : "☆")).join("");

const AdminReviews: NextPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (id: string) => {
    await fetch(`/api/admin/reviews/${id}`, { method: "PATCH" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <Head><title>Admin | Reviews</title></Head>
      <AdminLayout>
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-6">Customer Reviews</h1>
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet.</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3">Reviewer</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Review</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {reviews.map((r) => (
                    <tr key={r.id}>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.reviewerName}</td>
                      <td className="px-4 py-3 text-amber-500">{stars(r.rating)}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.body ?? "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${r.approved ? "bg-teal-100 text-teal-700" : "bg-amber-100 text-amber-700"}`}>
                          {r.approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        {!r.approved && (
                          <button onClick={() => approve(r.id)} className="text-xs text-teal-600 hover:underline">Approve</button>
                        )}
                        <button onClick={() => remove(r.id)} className="text-xs text-rose-600 hover:underline">Delete</button>
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

export default AdminReviews;
