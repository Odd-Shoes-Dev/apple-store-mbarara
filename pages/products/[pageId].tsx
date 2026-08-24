import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from "next";
import Head from "next/head";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Header from "../../components/Header";
import {
  getProductPrice,
  getProductDescription,
  getProductImage,
  getProductName,
} from "../../utils/computed";
import { useContext, useState, useEffect } from "react";
import CartContext from "../../components/context/CartContext";
import { useRouter } from "next/router";
import { Slide } from "@mui/material";
import { getCatalogService, getCategoryService } from "../../server/config/services";
import { CategoryWithChildren, Product } from "../../server/domain/types";

interface CustomContext extends GetServerSidePropsContext {
  query: {
    pageId?: string;
  };
}

type Props = {
  product: Product | null;
  navTree: CategoryWithChildren[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context: CustomContext
) => {
  const { pageId } = context.query;

  const [product, navTree] = await Promise.all([
    pageId ? getCatalogService().getActiveProductById(pageId) : Promise.resolve(null),
    getCategoryService().getNavTree(),
  ]);

  return {
    props: {
      product: product ? JSON.parse(JSON.stringify(product)) : null,
      navTree: JSON.parse(JSON.stringify(navTree.filter((d) => d.slug !== "other"))),
    },
  };
};

const ProductPage: NextPage<Props> = ({ product, navTree }) => {
  const { add, alert = null, isAlertVisible } = useContext(CartContext);
  const [hideAlert, setHideAlert] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (isAlertVisible) {
      timeout = setTimeout(() => {
        setHideAlert(true);
      }, 1760);
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

  const addToCart = () => {
    if (add && product) {
      add(product);
    }
  };

  const router = useRouter();

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push("/");
  };

  if (!product) {
    return (
      <>
        <Head>
          <title>Apple Store</title>
        </Head>
        <main>
          <Header navTree={navTree} />
          <p>Product not found</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Apple Store</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>
        <Header navTree={navTree} />
        <div className="bg-gray-100 min-h-screen relative w-full">
          <div className="w-full max-w-5xl px-8 mx-auto sm:px-8 lg:px-3">
            <button
              className="inline-block mt-6 w-max bg-slate-800 border border-transparent rounded-3xl py-2 px-6 items-center justify-center text-sm font-medium text-white hover:bg-slate-700"
              onClick={handleBack}
              title="Go back to store"
            >{`⇦ Back to store`}</button>
          </div>

          <LazyLoadImage
            src={getProductImage(product)}
            alt={getProductDescription(product)}
            className="max-w-sm mx-auto h-full object-center object-cover mt-5"
          />
          <h1 className=" text-3xl text-gray-900 text-center mt-8">
            {getProductName(product)}
          </h1>
          <p className=" text-xl text-center italic px-4 mt-6">
            {getProductDescription(product)}
          </p>
          <p className=" text-5xl text-center mt-8 tracking-wide text-gray-700">{`${getProductPrice(product)}$`}</p>

          <div className="mt-4">
            <button
              onClick={addToCart}
              className="relative mt-5 mb-5 w-[15rem] mx-auto flex bg-gray-300 border border-transparent rounded-md py-2 px-8 items-center justify-center text-sm font-medium text-gray-900 hover:bg-gray-400 hover:text-slate-100 lg:active:bg-gray-200 lg:active:text-gray-900 transition-all duration-200 ease-in-out"
            >
              Add to bag
            </button>
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

export default ProductPage;
