import type { GetServerSideProps, NextPage } from "next";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";
import { useState, useEffect, useContext } from "react";
import Spinner from "../components/Spinner";
import Head from "next/head";
import CartContext from "../components/context/CartContext";
import { Slide } from "@mui/material";
import Select, { SingleValue } from "react-select";
import { getCatalogService } from "../server/config/services";
import { Product } from "../server/domain/types";

export const getServerSideProps: GetServerSideProps = async () => {
  const all = await getCatalogService().listActiveProducts();

  const iphones = all.filter((product) => product.category === "IPHONE");
  const macbooks = all.filter((product) => product.category === "MACBOOK");
  const watches = all.filter((product) => product.category === "WATCH");

  return {
    props: {
      all: JSON.parse(JSON.stringify(all)),
      iphones: JSON.parse(JSON.stringify(iphones)),
      macbooks: JSON.parse(JSON.stringify(macbooks)),
      watches: JSON.parse(JSON.stringify(watches)),
    },
  };
};

type Props = {
  all: Product[];
  iphones: Product[];
  macbooks: Product[];
  watches: Product[];
};

interface CategorieState {
  all: boolean;
  iphone: boolean;
  macbook: boolean;
  watch: boolean;
}

interface Option {
  value: string;
  label: string;
}

const Home: NextPage<Props> = ({ all, iphones, macbooks, watches }) => {
  const [categorie, setCategorie] = useState<CategorieState>({
    all: true,
    iphone: false,
    macbook: false,
    watch: false,
  });

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
    const buttons = document.querySelectorAll("button");
    buttons.forEach((btn) => {
      if (btn.value === "all") {
        btn.style.pointerEvents = "none";
      }
    });

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

  const handleCategorieClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const button = e.target as HTMLButtonElement;
    const buttonValue = button.value as keyof CategorieState;

    setCategorie((prevCategorie) => {
      const buttons = document.querySelectorAll("button");
      buttons.forEach((btn) => {
        btn.style.pointerEvents = "auto";
      });

      button.style.pointerEvents = "none";

      setLoading(true);

      setTimeout(() => {
        setLoading(false);
      }, 500);

      return {
        ...prevCategorie,
        all: false,
        iphone: false,
        macbook: false,
        watch: false,
        [buttonValue]: !prevCategorie[buttonValue],
      };
    });
  };

  const applySorting = (items: Product[], option: Option | null): Product[] => {
    if (!option) return items;

    let selectedItems: Product[] = [...items];

    switch (option.value) {
      case "highToLow": {
        selectedItems.sort((a, b) => b.priceCents - a.priceCents);
        break;
      }
      case "lowToHigh": {
        selectedItems.sort((a, b) => a.priceCents - b.priceCents);
        break;
      }
      case "new": {
        selectedItems.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      }
      default: {
        break;
      }
    }

    return selectedItems;
  };

  const filteredItems = (): Product[] => {
    switch (true) {
      case categorie.all:
        return applySorting(all, selectedOption);
      case categorie.iphone:
        return applySorting(iphones, selectedOption);
      case categorie.macbook:
        return applySorting(macbooks, selectedOption);
      case categorie.watch:
        return applySorting(watches, selectedOption);
      default:
        return [];
    }
  };

  return (
    <>
      <Head>
        <title>Apple Store</title>
      </Head>
      <main className="bg-gray-100 min-h-screen">
        <Header />
        <div className="max-w-5xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center sm:justify-between flex-wrap gap-4 border-b pb-3 pl-5 lg:pl-0 px-6 sm:px-8 lg:px-1">
            <button
              value="all"
              onClick={handleCategorieClick}
              style={{
                color: categorie.all ? "white" : "black",
                backgroundColor: categorie.all ? "black" : "white",
              }}
              className={`font-normal tracking-wide leading-10 text-2xl shadow-lg px-4 rounded-md lg:hover:opacity-60 transition-all`}
            >
              All
            </button>
            <button
              value="iphone"
              onClick={handleCategorieClick}
              style={{
                color: categorie.iphone ? "white" : "black",
                backgroundColor: categorie.iphone ? "black" : "white",
              }}
              className={`font-normal tracking-wide leading-10 text-2xl shadow-lg px-4 rounded-md lg:hover:opacity-60 transition-all`}
            >
              iPhone
            </button>
            <button
              value="macbook"
              onClick={handleCategorieClick}
              style={{
                color: categorie.macbook ? "white" : "black",
                backgroundColor: categorie.macbook ? "black" : "white",
              }}
              className={`font-normal tracking-wide leading-10 text-2xl shadow-lg px-4 rounded-md lg:hover:opacity-60 transition-all`}
            >
              MacBook
            </button>
            <button
              value="watch"
              onClick={handleCategorieClick}
              style={{
                color: categorie.watch ? "white" : "black",
                backgroundColor: categorie.watch ? "black" : "white",
              }}
              className={`font-normal tracking-wide leading-10 text-2xl shadow-lg px-4 rounded-md lg:hover:opacity-60 transition-all`}
            >
              Watch
            </button>
          </div>
          <div className="px-6 sm:px-8 lg:px-0">
            <Select
              value={selectedOption}
              onChange={handleSelectChange}
              options={options}
              placeholder="Select sorting"
            />
          </div>
          <div className="mt-8 grid justify-items-center grid-cols-1 gap-y-20 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3 xl:gap-x-8">
            {!loading && filteredItems().map((p) => (
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
