import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { requireAdminPage } from "../../../lib/adminAuth";
import AdminLayout from "../../../components/admin/AdminLayout";
import RowActionsMenu from "../../../components/admin/RowActionsMenu";
import Spinner from "../../../components/Spinner";
import { useConfirm } from "../../../components/context/ConfirmContext";
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
  const confirm = useConfirm();

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
          }. Products under them become uncategorized, not deleted.`
        : `Products under "${category.name}" become uncategorized, not deleted.`;

    if (
      !(await confirm(warning, {
        title: `Delete "${category.name}"?`,
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return;

    await fetch(`/api/admin/categories/${category.id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <Head>
        <title>Admin | Categories</title>
      </Head>
      <AdminLayout>
        <main className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Categories</h1>
            <Link
              href="/admin/categories/new"
              className="bg-slate-800 text-white rounded-md px-4 py-2 text-sm hover:bg-slate-900"
            >
              + New category
            </Link>
          </div>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
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
                      <td className="px-4 py-2 text-sm text-right">
                        <RowActionsMenu
                          actions={[
                            { label: "Edit", href: `/admin/categories/${category.id}/edit` },
                            { label: "Delete", onClick: () => remove(category), destructive: true },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!loading && categories.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-8">No categories yet.</p>
            )}
            {loading && (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            )}
          </div>
        </main>
      </AdminLayout>
    </>
  );
};

export default AdminCategories;
