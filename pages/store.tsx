import type { GetServerSideProps, NextPage } from "next";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import { Fragment, useState, useEffect, useContext } from "react";
import Spinner from "../components/Spinner";
import Head from "next/head";
import CartContext from "../components/context/CartContext";
import { Slide } from "@mui/material";
import { Popover, Transition } from "@headlessui/react";
import { SearchIcon, AdjustmentsIcon } from "@heroicons/react/outline";
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

const StorePage: NextPage<Props> = ({ products, navTree, selectedCategory }) => {
  const [search, setSearch] = useState("");
  const [selectedOption, setSelectedOption] = useState<Option | null>({
    value: "new",
    label: "Sort By Addition Date",
  });

  const options = [
    { value: "new", label: "Sort By Addition Date" },
    { value: "highToLow", label: "Price: High to Low" },
    { value: "lowToHigh", label: "Price: Low to High" },
  ];

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
    const items = [...products].filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );

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
        <title>Shop — Apple Store Mbarara</title>
      </Head>
      <main className="bg-gray-100 min-h-screen">
        <Header navTree={navTree} />
        <div className="max-w-5xl mx-auto py-8 px-2 sm:px-4">
          {selectedCategory && (
            <h1 className="text-2xl font-semibold text-gray-900 px-6 sm:px-8 lg:px-0 mb-4">
              {selectedCategory.name}
            </h1>
          )}
          <div className="px-2 sm:px-4 lg:px-0">
            <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm">
              <SearchIcon className="w-5 h-5 text-gray-400 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-transparent"
              />
              <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />
              <Popover className="relative">
                {({ close }) => (
                  <>
                    <Popover.Button className="flex items-center px-3 py-2.5 text-gray-500 hover:text-gray-700 focus:outline-none">
                      <AdjustmentsIcon className="w-5 h-5" />
                    </Popover.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-150"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <Popover.Panel className="absolute right-0 top-full mt-2 w-52 bg-white shadow-lg rounded-md ring-1 ring-black ring-opacity-5 py-1 z-50">
                        {options.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => { setSelectedOption(option); close(); }}
                            className={`w-full text-left px-4 py-2 text-sm ${
                              selectedOption?.value === option.value
                                ? "font-medium text-gray-900 bg-gray-50"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </Popover.Panel>
                    </Transition>
                  </>
                )}
              </Popover>
            </div>
          </div>
          {!loading && sortedProducts().length === 0 && (
            <p className="text-center text-gray-500 mt-12">
              {search
                ? `No products match "${search}".`
                : selectedCategory
                ? `No items currently available under ${selectedCategory.name}.`
                : "No products found."}
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

export default StorePage;
