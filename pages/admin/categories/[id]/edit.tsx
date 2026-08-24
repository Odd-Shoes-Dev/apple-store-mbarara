import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { requireAdminPage } from "../../../../lib/adminAuth";
import { getCategoryService } from "../../../../server/config/services";
import CategoryForm from "../../../../components/admin/CategoryForm";
import { Category } from "../../../../server/domain/types";

type Props = { category: Category };

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const redirect = await requireAdminPage(context);
  if (redirect) return redirect;

  const id = context.params?.id as string;
  const category = await getCategoryService().getById(id);

  if (!category) {
    return { notFound: true };
  }

  return { props: { category } };
};

const EditCategory: NextPage<Props> = ({ category }) => {
  return (
    <>
      <Head>
        <title>Admin | Edit {category.name}</title>
      </Head>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/admin/categories" className="text-sm text-gray-500 hover:text-gray-800">
              ⇦ Categories
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Edit {category.name}</h1>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-6">
          <CategoryForm initial={category} />
        </main>
      </div>
    </>
  );
};

export default EditCategory;
