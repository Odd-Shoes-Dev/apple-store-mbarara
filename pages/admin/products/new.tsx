import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { requireAdminPage } from "../../../lib/adminAuth";
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
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-800">
              ⇦ Products
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">New product</h1>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          <ProductForm />
        </main>
      </div>
    </>
  );
};

export default NewProduct;
