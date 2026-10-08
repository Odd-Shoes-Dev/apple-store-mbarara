import type { GetServerSideProps, NextPage } from "next";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import PageHero from "../components/PageHero";
import TabPills, { Tab } from "../components/TabPills";
import { Fragment, useState, useEffect, useContext, useMemo } from "react";
import Spinner from "../components/Spinner";
import Head from "next/head";
import CartContext from "../components/context/CartContext";
import { Slide } from "@mui/material";
import { Popover, Transition } from "@headlessui/react";
import { SearchIcon, AdjustmentsIcon } from "@heroicons/react/outline";
import { getCatalogService, getCategoryService } from "../server/config/services";
import { CategoryWithChildren, Product } from "../server/domain/types";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { category: categorySlug } = context.query;
  const categoryService = getCategoryService();

  const [products, navTree] = await Promise.all([
    getCatalogService().listActiveProducts(),
    categoryService.getNavTree(),
  ]);

  const filteredTree = navTree.filter((d) => d.slug !== "other");

  // A header link may point at a department slug directly, or at one of its
  // child models — either way we resolve it down to the owning department tab.
  // A model-specific link also pre-fills the search box with that model's name,
  // so the grid narrows to it without needing a second tier of tabs.
  let initialTab = "all";
  let initialSearch = "";
  if (typeof categorySlug === "string") {
    const directDept = filteredTree.find((d) => d.slug === categorySlug);
    let parentDept: CategoryWithChildren | undefined;
    let matchedModel: CategoryWithChildren["children"][number] | undefined;
    for (const dept of filteredTree) {
      const model = dept.children.find((c) => c.slug === categorySlug);
      if (model) {
        parentDept = dept;
        matchedModel = model;
        break;
      }
    }
    initialTab = directDept?.slug ?? parentDept?.slug ?? "all";
    initialSearch = matchedModel?.name ?? "";
  }

  return {
    props: {
      products: JSON.parse(JSON.stringify(products)),
      navTree: JSON.parse(JSON.stringify(filteredTree)),
      initialTab,
      initialSearch,
    },
  };
};

type Props = {
  products: Product[];
  navTree: CategoryWithChildren[];
  initialTab: string;
  initialSearch: string;
};

interface Option {
  value: string;
  label: string;
}

const StorePage: NextPage<Props> = ({ products, navTree, initialTab, initialSearch }) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedTab, setSelectedTab] = useState(initialTab);
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

  const tabs: Tab[] = useMemo(() => {
    const departmentTabs = navTree
      .map((dept) => {
        const deptIds = new Set([dept.id, ...dept.children.map((c) => c.id)]);
        const count = products.filter((p) => p.category && deptIds.has(p.category.id)).length;
        return { label: dept.name, value: dept.slug, count };
      })
      .filter((tab) => tab.count > 0);

    return [{ label: "All", value: "all", count: products.length }, ...departmentTabs];
  }, [navTree, products]);

  const selectedDept = navTree.find((d) => d.slug === selectedTab);
  const selectedDeptIds = selectedDept
    ? new Set([selectedDept.id, ...selectedDept.children.map((c) => c.id)])
    : null;

  const sortedProducts = (): Product[] => {
    const items = [...products]
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => !selectedDeptIds || (p.category && selectedDeptIds.has(p.category.id)));

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
        <Header />

        <PageHero
          eyebrow="Shop"
          title="Find your next Apple device."
          subtitle="Genuine products, fair pricing, and fast delivery across Mbarara."
          pills={["Genuine & Sealed", "Warranty Included", "WhatsApp Support"]}
        />

        <div className="max-w-5xl mx-auto py-8 px-2 sm:px-4">
          <div className="px-2 sm:px-4 lg:px-0 mb-5">
            <TabPills tabs={tabs} active={selectedTab} onChange={setSelectedTab} />
          </div>
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
                : selectedDept
                ? `No items currently available under ${selectedDept.name}.`
                : "No products found."}
            </p>
          )}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
