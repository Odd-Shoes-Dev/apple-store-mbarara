import type { GetServerSideProps, NextPage } from "next";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import { useState, useEffect, useContext } from "react";
import Spinner from "../components/Spinner";
import Head from "next/head";
import CartContext from "../components/context/CartContext";
import { Slide } from "@mui/material";
import Select, { SingleValue } from "react-select";
import { getCatalogService, getCategoryService } from "../server/config/services";
import { Category, CategoryWithChildren, Product } from "../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { category: categorySlug } = context.query;
  const categoryService = getCategoryService();

  const selectedCategory =
    typeof categorySlug === "string" ? await categoryService.getBySlug(categorySlug) : null;

  const categoryIds = selectedCategory
    ? await categoryService.resolveFilterIds(selectedCategory.id)
    : undefined;

  const [products, navTree] = await Promise.all([
    getCatalogService().listActiveProducts(categoryIds),
    categoryService.getNavTree(),
  ]);

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      navTree: JSON.parse(JSON.stringify(navTree.filter((d) => d.slug !== "other"))),
      selectedCategory: selectedCategory ? JSON.parse(JSON.stringify(selectedCategory)) : null,
    },
  };
};

type Props = {
  products: Product[];
  navTree: CategoryWithChildren[];
  selectedCategory: Category | null;
};

interface Option {
  value: string;
  label: string;
}

const Home: NextPage<Props> = ({ products, navTree, selectedCategory }) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>({
    value: "new",
    label: "Sort By Addition Date",
  });

  const options = [
    { value: "new", label: "Sort By Addition Date" },
    { value: "highToLow", label: "Price: High to Low" },
    { value: "lowToHigh", label: "Price: Low to High" },
  ];

  const handleSelectChange = (
    option: SingleValue<{ value: string; label: string }>
  ) => {
    setSelectedOption(option);
  };

  const [loading, setLoading] = useState(true);

  const { alert = null, isAlertVisible } = useContext(CartContext);
  const [hideAlert, setHideAlert] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (isAlertVisible) {
      timeout = setTimeout(() => {
        setHideAlert(true);
      }, 1770);
    }

    return () => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
    };
  }, [isAlertVisible]);

  const handleAlertExited = () => {
    setHideAlert(false);
  };

  const sortedProducts = (): Product[] => {
    const items = [...products];

    switch (selectedOption?.value) {
      case "highToLow":
        items.sort((a, b) => b.priceCents - a.priceCents);
        break;
      case "lowToHigh":
        items.sort((a, b) => a.priceCents - b.priceCents);
        break;
      case "new":
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    return items;
  };

  return (
    <>
      <Head>
        <title>Apple Store</title>
      </Head>
      <main className="bg-gray-100 min-h-screen">
        <Header navTree={navTree} />
        <div className="max-w-5xl mx-auto py-8 px-2 sm:px-4">
          {selectedCategory && (
            <h1 className="text-2xl font-semibold text-gray-900 px-6 sm:px-8 lg:px-0 mb-4">
              {selectedCategory.name}
            </h1>
          )}
          <div className="px-6 sm:px-8 lg:px-0">
            <Select
              instanceId="sort-select"
              value={selectedOption}
              onChange={handleSelectChange}
              options={options}
              placeholder="Select sorting"
            />
          </div>
          {!loading && products.length === 0 && selectedCategory && (
            <p className="text-center text-gray-500 mt-12">
              No items currently available under {selectedCategory.name}.
            </p>
          )}
          <div className="mt-8 grid justify-items-center grid-cols-1 gap-y-8 sm:grid-cols-2 sm:gap-y-20 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
            {!loading && sortedProducts().map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
          <div
            className={`fixed z-999 top-0 left-0 w-full h-full flex items-center justify-center ${
              loading ? "visible" : "invisible"
            }`}
          >
            {loading && <Spinner />}
          </div>
        </div>
        <div className="fixed bottom-10 left-5" style={{ zIndex: 999 }}>
          {isAlertVisible && alert !== null && (
            <Slide
              direction="right"
              in={!hideAlert}
              onExited={handleAlertExited}
              unmountOnExit
            >
              {alert}
            </Slide>
          )}
        </div>
      </main>
    </>
  );
};

export default Home;
