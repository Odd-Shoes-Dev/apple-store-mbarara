import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { requireAdminPage } from "../../../../lib/adminAuth";
import { getCatalogService } from "../../../../server/config/services";
import AdminLayout from "../../../../components/admin/AdminLayout";
import ProductForm from "../../../../components/admin/ProductForm";
import { Product } from "../../../../server/domain/types";

type Props = { product: Product };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;

  const id = context.params?.id as string;
  const product = await getCatalogService().getProductById(id);

  if (!product) {
    return { notFound: true };
  }

  return { props: { product: JSON.parse(JSON.stringify(product)) } };
};

const EditProduct: NextPage<Props> = ({ product }) => {
  return (
    <>
      <Head>
        <title>Admin | Edit {product.name}</title>
      </Head>
      <AdminLayout>
        <main className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-800">
              ⇦ Products
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Edit {product.name}</h1>
          </div>
          <ProductForm initial={product} />
        </main>
      </AdminLayout>
    </>
  );
};

export default EditProduct;
