import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { requireAdminPage } from "../../../../lib/adminAuth";
import { getCatalogService } from "../../../../server/config/services";
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
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/admin/products" className="text-sm text-gray-500 hover:text-gray-800">
              ⇦ Products
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Edit {product.name}</h1>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          <ProductForm initial={product} />
        </main>
      </div>
    </>
  );
};

export default EditProduct;
