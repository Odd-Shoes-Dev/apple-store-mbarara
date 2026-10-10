import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { requireAdminPage } from "../../../lib/adminAuth";
import AdminLayout from "../../../components/admin/AdminLayout";
import RowActionsMenu from "../../../components/admin/RowActionsMenu";
import Spinner from "../../../components/Spinner";
import { useConfirm } from "../../../components/context/ConfirmContext";
import { fetcher } from "../../../lib/swrFetcher";
import { formatCurrency } from "../../../utils/currency";
import { Category, ProductPage } from "../../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

type CategoryRow = Category & { parentName: string | null };

const PAGE_SIZE = 20;

const AdminProducts: NextPage = () => {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "true" | "false">("ALL");
  const [page, setPage] = useState(1);
  const confirm = useConfirm();

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  // Revisiting the same filters/page reuses this cache instead of refetching.
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (categoryId !== "ALL") params.set("categoryId", categoryId);
  if (activeFilter !== "ALL") params.set("active", activeFilter);
  params.set("page", String(page));
  params.set("pageSize", String(PAGE_SIZE));

  const { data, isLoading, mutate } = useSWR<ProductPage>(
    `/api/admin/products?${params.toString()}`,
    fetcher
  );
  const products = data?.products ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    setPage(1);
  }, [search, categoryId, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const archive = async (id: string) => {
    if (!(await confirm("Archive this product?", { confirmLabel: "Archive", destructive: true }))) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    mutate();
  };

  const deleteProduct = async (id: string) => {
    if (
      !(await confirm("This also deletes its images and cannot be undone.", {
        title: "Permanently delete this product?",
        confirmLabel: "Delete",
        destructive: true,
      }))
    )
      return;
    await fetch(`/api/admin/products/${id}?hard=true`, { method: "DELETE" });
    mutate();
  };

  return (
    <>
      <Head>
        <title>Admin | Products</title>
      </Head>
      <AdminLayout>
        <main className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Products</h1>
            <Link
              href="/admin/products/new"
              className="bg-slate-800 text-white rounded-md px-4 py-2 text-sm hover:bg-slate-900"
            >
              + New product
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="ALL">ALL</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parentName ? `${c.parentName} — ${c.name}` : c.name}
                </option>
              ))}
            </select>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as "ALL" | "true" | "false")}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="ALL">All</option>
              <option value="true">Active</option>
              <option value="false">Archived</option>
            </select>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!isLoading &&
                  products.map((product) => (
                    <tr key={product.id}>
                      <td className="px-4 py-2">
                        {product.images[0] && (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{product.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{product.category?.name ?? "—"}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {formatCurrency(product.priceCents / 100, product.currency)}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={product.active ? "text-emerald-600" : "text-gray-400"}>
                          {product.active ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-right">
                        <RowActionsMenu
                          actions={[
                            { label: "Edit", href: `/admin/products/${product.id}/edit` },
                            { label: "Archive", onClick: () => archive(product.id), destructive: true, hidden: !product.active },
                            { label: "Delete", onClick: () => deleteProduct(product.id), destructive: true },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!isLoading && products.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-8">No products found.</p>
            )}
            {isLoading && (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            )}
          </div>

          {!isLoading && total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} ({total} product{total === 1 ? "" : "s"})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page <= 1}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
      </AdminLayout>
    </>
  );
};

export default AdminProducts;
