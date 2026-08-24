import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Header from "../../components/Header";
import { getCategoryService } from "../../server/config/services";
import { Category, CategoryWithChildren } from "../../server/domain/types";

interface CustomContext extends GetServerSidePropsContext {
  query: { slug?: string };
}

type Props = {
  department: Category;
  children: Category[];
  navTree: CategoryWithChildren[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (context: CustomContext) => {
  const { slug } = context.query;
  const categoryService = getCategoryService();

  const department = slug ? await categoryService.getBySlug(slug) : null;
  if (!department) {
    return { notFound: true };
  }

  const navTree = await categoryService.getNavTree();
  const current = navTree.find((d) => d.id === department.id);
  const children = current?.children ?? [];

  if (children.length === 0) {
    return {
      redirect: { destination: `/?category=${department.slug}`, permanent: false },
    };
  }

  return {
    props: {
      department: JSON.parse(JSON.stringify(department)),
      children: JSON.parse(JSON.stringify(children)),
      navTree: JSON.parse(JSON.stringify(navTree.filter((d) => d.slug !== "other"))),
    },
  };
};

const CategoryLanding: NextPage<Props> = ({ department, children, navTree }) => {
  return (
    <>
      <Head>
        <title>Apple Store | {department.name}</title>
      </Head>
      <main className="bg-gray-100 min-h-screen">
        <Header navTree={navTree} />
        <div className="max-w-5xl mx-auto py-8 px-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">{department.name}</h1>
          <Link
            href={{ pathname: "/", query: { category: department.slug } }}
            className="block bg-white rounded-lg shadow p-4 mb-4 text-center font-medium text-gray-900 hover:bg-gray-50"
          >
            {`All ${department.name}`}
          </Link>
          <div className="grid grid-cols-2 gap-4">
            {children.map((model) => (
              <Link
                key={model.id}
                href={{ pathname: "/", query: { category: model.slug } }}
                className="bg-white rounded-lg shadow p-4 text-center text-gray-700 hover:bg-gray-50"
              >
                {model.name}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default CategoryLanding;
