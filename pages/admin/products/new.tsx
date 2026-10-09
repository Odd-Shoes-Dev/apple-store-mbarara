import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { requireAdminPage } from "../../../lib/adminAuth";
import AdminLayout from "../../../components/admin/AdminLayout";
import ProductForm from "../../../components/admin/ProductForm";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;
  return { props: {} };
};

const NewProduct: NextPage = () => {
  return (
    <>
      <Head>
        <title>Admin | New product</title>
      </Head>
      <AdminLayout>
        <main className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-800">
              ⇦ Products
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">New product</h1>
          </div>
          <ProductForm />
        </main>
      </AdminLayout>
    </>
  );
};

export default NewProduct;
