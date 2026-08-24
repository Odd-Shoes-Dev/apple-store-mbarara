import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { requireAdminPage } from "../../../lib/adminAuth";
import { Category, Product } from "../../../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

type CategoryRow = Category & { parentName: string | null };

const AdminProducts: NextPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "true" | "false">("ALL");

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []));
  }, []);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categoryId !== "ALL") params.set("categoryId", categoryId);
    if (activeFilter !== "ALL") params.set("active", activeFilter);

    const res = await fetch(`/api/admin/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, categoryId, activeFilter]);

  const archive = async (id: string) => {
    if (!confirm("Archive this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <>
      <Head>
        <title>Admin | Products</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Products</h1>
            <div className="flex items-center gap-4">
              <Link href="/admin/categories" className="text-sm text-gray-500 hover:text-gray-800">
                Categories
              </Link>
              <Link
                href="/admin/products/new"
                className="bg-slate-800 text-white rounded-md px-4 py-2 text-sm hover:bg-slate-900"
              >
                New product
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="text-sm text-gray-500 hover:text-gray-800"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6">
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

          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                {!loading &&
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
                        ${(product.priceCents / 100).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={product.active ? "text-emerald-600" : "text-gray-400"}>
                          {product.active ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-right space-x-3">
                        <Link href={`/admin/products/${product.id}/edit`} className="text-slate-700 hover:underline">
                          Edit
                        </Link>
                        {product.active && (
                          <button onClick={() => archive(product.id)} className="text-rose-600 hover:underline">
                            Archive
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!loading && products.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-8">No products found.</p>
            )}
            {loading && <p className="text-center text-sm text-gray-500 py-8">Loading...</p>}
          </div>
        </main>
      </div>
    </>
  );
};

export default AdminProducts;
