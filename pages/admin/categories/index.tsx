import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { requireAdminPage } from "../../../lib/adminAuth";
import { Category } from "../../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

type Row = Category & { parentName: string | null };

const AdminCategories: NextPage = () => {
  const [categories, setCategories] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data.categories ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (category: Row) => {
    const childCount = categories.filter((c) => c.parentId === category.id).length;
    const warning =
      childCount > 0
        ? `Deleting "${category.name}" will also remove its ${childCount} sub-categor${
            childCount === 1 ? "y" : "ies"
          }. Products under them become uncategorized, not deleted. Continue?`
        : `Delete "${category.name}"? Products under it become uncategorized, not deleted.`;

    if (!confirm(warning)) return;

    await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <Head>
        <title>Admin | Categories</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/products"
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Products
              </Link>
              <Link
                href="/admin/categories/new"
                className="bg-slate-800 text-white rounded-md px-4 py-2 text-sm hover:bg-slate-900"
              >
                New category
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!loading &&
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{category.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{category.parentName ?? "—"}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{category.slug}</td>
                      <td className="px-4 py-2 text-sm text-right space-x-3">
                        <Link href={`/admin/categories/${category.id}/edit`} className="text-slate-700 hover:underline">
                          Edit
                        </Link>
                        <button onClick={() => remove(category)} className="text-rose-600 hover:underline">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!loading && categories.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-8">No categories yet.</p>
            )}
            {loading && <p className="text-center text-sm text-gray-500 py-8">Loading...</p>}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminCategories;
