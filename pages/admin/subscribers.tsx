import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { requireAdminPage } from "../../lib/adminAuth";
import { Subscriber } from "../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

const AdminSubscribers: NextPage = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/subscribers")
      .then((r) => r.json())
      .then((d) => { setSubscribers(d.subscribers ?? []); setLoading(false); });
  }, []);

  return (
    <>
      <Head><title>Admin | Subscribers</title></Head>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white border-b px-6 py-3 flex items-center gap-6 text-sm">
          <Link href="/admin/products" passHref><a className="font-medium text-gray-700 hover:text-gray-900">Products</a></Link>
          <Link href="/admin/reviews" passHref><a className="font-medium text-gray-700 hover:text-gray-900">Reviews</a></Link>
          <Link href="/admin/trade-in" passHref><a className="font-medium text-gray-700 hover:text-gray-900">Trade-in</a></Link>
          <Link href="/admin/subscribers" passHref><a className="font-semibold text-gray-900 underline">Subscribers</a></Link>
        </nav>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Newsletter Subscribers ({subscribers.length})</h1>
            <a
              href="/api/admin/subscribers?format=csv"
              className="bg-slate-800 text-white text-sm rounded-md px-4 py-2 hover:bg-slate-900"
            >
              Export CSV
            </a>
          </div>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : subscribers.length === 0 ? (
            <p className="text-gray-500">No subscribers yet.</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.map((s) => (
                    <tr key={s.id}>
                      <td className="px-4 py-3 text-gray-900">{s.email}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(s.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminSubscribers;
