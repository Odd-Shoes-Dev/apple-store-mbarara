import type { GetServerSideProps, NextPage } from "next";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import PageHero from "../components/PageHero";
import TabPills, { Tab } from "../components/TabPills";
import { Fragment, useState, useEffect, useRef, useContext } from "react";
import useSWRInfinite from "swr/infinite";
import Spinner from "../components/Spinner";
import SeoHead from "../components/SeoHead";
import CartContext from "../components/context/CartContext";
import { Slide } from "@mui/material";
import { Popover, Transition } from "@headlessui/react";
import { SearchIcon, AdjustmentsIcon } from "@heroicons/react/outline";
import { fetcher } from "../lib/swrFetcher";
import { getSiteOrigin } from "../lib/siteUrl";
import { getCatalogService, getCategoryService } from "../server/config/services";
import { CategoryWithChildren, Product, ProductPage, ProductSort } from "../server/domain/types";

const PAGE_SIZE = 12;

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { category: categorySlug } = context.query;
  const categoryService = getCategoryService();
  const catalogService = getCatalogService();

  const navTree = await categoryService.getNavTree();
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

  const selectedDept = filteredTree.find((d) => d.slug === initialTab);
  const selectedDeptIds = selectedDept
    ? [selectedDept.id, ...selectedDept.children.map((c) => c.id)]
    : undefined;

  const [firstPage, allCount, deptCounts] = await Promise.all([
    catalogService.listProductsPage(
      { active: true, search: initialSearch || undefined, categoryIds: selectedDeptIds, sort: "newest" },
      1,
      PAGE_SIZE
    ),
    catalogService.countActiveProducts(),
    Promise.all(
      filteredTree.map((dept) => catalogService.countActiveProducts([dept.id, ...dept.children.map((c) => c.id)]))
    ),
  ]);

  const tabs: Tab[] = [
    { label: "All", value: "all", count: allCount },
    ...filteredTree.map((dept, i) => ({ label: dept.name, value: dept.slug, count: deptCounts[i] })),
  ].filter((tab) => tab.value === "all" || (tab.count ?? 0) > 0);

  return {
    props: {
      initialProducts: JSON.parse(JSON.stringify(firstPage.products)),
      initialTotal: firstPage.total,
      navTree: JSON.parse(JSON.stringify(filteredTree)),
      tabs,
      initialTab,
      initialSearch,
      siteUrl: getSiteOrigin(context.req),
    },
  };
};

type Props = {
  initialProducts: Product[];
  initialTotal: number;
  navTree: CategoryWithChildren[];
  tabs: Tab[];
  initialTab: string;
  initialSearch: string;
  siteUrl: string;
};

interface Option {
  value: string;
  label: string;
}

function sortParamFor(value?: string): ProductSort {
  switch (value) {
    case "highToLow":
      return "priceDesc";
    case "lowToHigh":
      return "priceAsc";
    default:
      return "newest";
  }
}

const StorePage: NextPage<Props> = ({
  initialProducts,
  initialTotal,
  navTree,
  tabs,
  initialTab,
  initialSearch,
  siteUrl,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
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

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { alert = null, isAlertVisible } = useContext(CartContext);
  const [hideAlert, setHideAlert] = useState(false);

  const categoryIdsFor = (tabValue: string): string[] | undefined => {
    const dept = navTree.find((d) => d.slug === tabValue);
    return dept ? [dept.id, ...dept.children.map((c) => c.id)] : undefined;
  };

  // Debounce the search box before it drives a fetch.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const getKey = (pageIndex: number, previousPageData: ProductPage | null) => {
    if (previousPageData && previousPageData.products.length === 0) return null;

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    const categoryIds = selectedTab !== "all" ? categoryIdsFor(selectedTab) : undefined;
    if (categoryIds && categoryIds.length > 0) params.set("categoryIds", categoryIds.join(","));
    params.set("sort", sortParamFor(selectedOption?.value));
    params.set("page", String(pageIndex + 1));
    params.set("pageSize", String(PAGE_SIZE));
    return `/api/products?${params.toString()}`;
  };

  // Seed SWR's cache with what SSR already fetched for the initial filters,
  // so the first render doesn't re-fetch page 1 over the network.
  const { data, size, setSize, isValidating } = useSWRInfinite<ProductPage>(getKey, fetcher, {
    fallbackData: [{ products: initialProducts, total: initialTotal, page: 1, pageSize: PAGE_SIZE }],
    revalidateFirstPage: false,
  });

  const products = data ? data.flatMap((d) => d.products) : [];
  const total = data?.[0]?.total ?? initialTotal;
  const isLoadingInitial = !data;
  const isLoadingMore = isValidating && size > 0 && typeof data?.[size - 1] === "undefined";
  const hasMore = products.length < total;

  // Reset back to page 1 whenever filters change, instead of re-fetching
  // however many pages were loaded under the previous filter.
  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setSize(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, selectedOption, debouncedSearch]);

  // Infinite scroll: load the next page once the sentinel comes into view.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoadingInitial) {
          setSize(size + 1);
        }
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, hasMore, isLoadingMore, isLoadingInitial]);

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

  const selectedDept = navTree.find((d) => d.slug === selectedTab);

  return (
    <>
      <SeoHead
        title="Shop — Apple Store Mbarara"
        description="Browse genuine iPhone, MacBook, iPad, Watch and AirPods — fair pricing and fast delivery across Mbarara."
        image={`${siteUrl}/logo.png`}
        url={`${siteUrl}/store`}
      />
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
          {!isLoadingInitial && products.length === 0 && (
            <p className="text-center text-gray-500 mt-12">
              {debouncedSearch
                ? `No products match "${debouncedSearch}".`
                : selectedDept
                ? `No items currently available under ${selectedDept.name}.`
                : "No products found."}
            </p>
          )}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {!isLoadingInitial && products.map((p) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
          <div ref={sentinelRef} className="h-1" />
          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          )}
          <div
            className={`fixed z-999 top-0 left-0 w-full h-full flex items-center justify-center ${
              isLoadingInitial ? "visible" : "invisible"
            }`}
          >
            {isLoadingInitial && <Spinner />}
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
