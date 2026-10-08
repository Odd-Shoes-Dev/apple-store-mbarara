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
  formatPrice,
  getProductDescription,
  getProductImage,
  getProductName,
} from "../../utils/computed";
import { useContext, useState, useEffect } from "react";
import CartContext from "../../components/context/CartContext";
import { useRouter } from "next/router";
import { Slide } from "@mui/material";
import { getCatalogService, getCategoryService, getSpecService, getReviewService } from "../../server/config/services";
import { CONDITION_LABELS, CategoryWithChildren, Product, ProductSpec, Review } from "../../server/domain/types";
import ProductCard from "../../components/ProductCard";

interface CustomContext extends GetServerSidePropsContext {
  query: {
    pageId?: string;
  };
}

type Props = {
  product: Product | null;
  navTree: CategoryWithChildren[];
  whatsappNumber: string | null;
  related: Product[];
  specs: ProductSpec[];
  reviews: Review[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context: CustomContext
) => {
  const { pageId } = context.query;

  const catalogService = getCatalogService();
  const [product, navTree] = await Promise.all([
    pageId ? catalogService.getActiveProductById(pageId) : Promise.resolve(null),
    getCategoryService().getNavTree(),
  ]);

  const [related, specs, reviews] = await Promise.all([
    product
      ? catalogService.listRelated(product.id, product.category?.id ?? null)
      : Promise.resolve([]),
    product ? getSpecService().listForProduct(product.id) : Promise.resolve([]),
    product ? getReviewService().listApproved(product.id) : Promise.resolve([]),
  ]);

  return {
    props: {
      product: product ? JSON.parse(JSON.stringify(product)) : null,
      navTree: JSON.parse(JSON.stringify(navTree.filter((d) => d.slug !== "other"))),
      whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? null,
      related: JSON.parse(JSON.stringify(related)),
      specs: JSON.parse(JSON.stringify(specs)),
      reviews: JSON.parse(JSON.stringify(reviews)),
    },
  };
};

const ProductPage: NextPage<Props> = ({ product, navTree, related, specs, reviews }) => {
  const { add, alert = null, isAlertVisible } = useContext(CartContext);
  const [hideAlert, setHideAlert] = useState(false);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

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

  const outOfStock = product ? product.stockCount === 0 : false;
  const lowStock = product ? product.stockCount > 0 && product.stockCount <= 3 : false;
  const isOnSale =
    product?.originalPriceCents != null &&
    product.originalPriceCents > product.priceCents;

  const [reviewForm, setReviewForm] = useState({ reviewerName: "", rating: 5, body: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const addToCart = () => {
    if (add && product && !outOfStock) {
      add(product);
    }
  };

  const router = useRouter();

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    router.push("/store");
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

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setReviewError(null);
    setReviewSubmitting(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...reviewForm, productId: product.id }),
    });
    setReviewSubmitting(false);
    if (!res.ok) {
      setReviewError("Failed to submit review");
      return;
    }
    setReviewDone(true);
  };

  const waLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hi, I'm interested in the ${product.name}`
      )}`
    : null;

  return (
    <>
      <Head>
        <title>{product.name} — Apple Store Mbarara</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main>
        <Header navTree={navTree} />
        <div className="bg-gray-100 min-h-screen relative w-full pb-16">
          <div className="w-full max-w-5xl px-8 mx-auto sm:px-8 lg:px-3">
            <button
              className="inline-block mt-6 w-max bg-slate-800 border border-transparent rounded-3xl py-2 px-6 items-center justify-center text-sm font-medium text-white hover:bg-slate-700"
              onClick={handleBack}
              title="Go back to store"
            >{`⇦ Back to store`}</button>
          </div>

          <div className="w-full max-w-5xl mx-auto px-5 lg:px-3 mt-5 flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-16">
            {/* Image — left on desktop, top on mobile */}
            <div className="flex-1 flex items-center justify-center">
              <LazyLoadImage
                src={getProductImage(product)}
                alt={getProductDescription(product)}
                className="max-w-sm w-full h-full object-center object-cover"
              />
            </div>

            {/* Content — right on desktop, stacked below on mobile */}
            <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left">
              <h1 className="text-3xl text-gray-900 mt-8 lg:mt-0">
                {getProductName(product)}
              </h1>
              <p className="text-xl italic px-4 lg:px-0 mt-6">
                {getProductDescription(product)}
              </p>

              {/* Price (with original strike-through if on sale) */}
              <div className="flex flex-col items-center lg:items-start mt-8">
                <p className="text-5xl tracking-wide text-gray-700">
                  {formatPrice(getProductPrice(product))}
                </p>
                {isOnSale && product.originalPriceCents && (
                  <p className="text-xl text-gray-400 line-through mt-1">
                    {formatPrice(product.originalPriceCents)}
                  </p>
                )}
              </div>

              {/* Trust icon row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mt-8 px-4 lg:px-0">
                {product.isAuthentic && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-500">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    <span>Genuine / Authentic</span>
                  </div>
                )}
                {product.warrantyMonths && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{product.warrantyMonths}-month warranty</span>
                  </div>
                )}
                {product.condition !== "brand_new" && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                    <span>{CONDITION_LABELS[product.condition]}</span>
                  </div>
                )}
              </div>

              {/* Low stock warning */}
              {lowStock && (
                <p className="text-center lg:text-left text-amber-600 text-sm font-medium mt-4">
                  Only {product.stockCount} left in stock
                </p>
              )}

              {/* CTA buttons */}
              <div className="mt-4 flex flex-col items-center lg:items-start gap-3">
                <button
                  onClick={addToCart}
                  disabled={outOfStock}
                  className="relative mt-5 w-[15rem] flex bg-gray-300 border border-transparent rounded-md py-2 px-8 items-center justify-center text-sm font-medium text-gray-900 hover:bg-gray-400 hover:text-slate-100 transition-all duration-200 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {outOfStock ? "Out of Stock" : "Add to bag"}
                </button>

                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[15rem] flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-md py-2 px-8 text-sm font-medium hover:bg-[#1ebe5d] transition-colors duration-200"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Ask about this product
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {specs.length > 0 && (
          <section className="max-w-lg mx-auto px-5 py-10">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h2>
            <table className="w-full text-sm">
              <tbody>
                {(showAllSpecs ? specs : specs.slice(0, 6)).map((spec) => (
                  <tr key={spec.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 font-medium text-gray-600 w-1/2">{spec.label}</td>
                    <td className="py-2 text-gray-900">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {specs.length > 6 && (
              <button onClick={() => setShowAllSpecs(!showAllSpecs)} className="mt-3 text-sm text-blue-600 hover:underline">
                {showAllSpecs ? "Show less" : `Show all ${specs.length} specs`}
              </button>
            )}
          </section>
        )}

        {/* Reviews */}
        <section className="max-w-lg mx-auto px-5 py-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Customer Reviews</h2>
          {reviews.length === 0 && <p className="text-sm text-gray-400 mb-6">No reviews yet. Be the first!</p>}
          <div className="space-y-4 mb-8">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className="text-sm font-medium text-gray-900">{r.reviewerName}</span>
                </div>
                {r.body && <p className="text-sm text-gray-600">{r.body}</p>}
              </div>
            ))}
          </div>

          {/* Review form */}
          {reviewDone ? (
            <p className="text-sm text-teal-600 font-medium">Thanks! Your review is pending approval.</p>
          ) : (
            <form onSubmit={submitReview} className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Leave a review</h3>
              {reviewError && <p className="text-xs text-rose-600">{reviewError}</p>}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">Name</label>
                  <input required value={reviewForm.reviewerName} onChange={(e) => setReviewForm((f) => ({ ...f, reviewerName: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-600 mb-1">Rating</label>
                  <select value={reviewForm.rating} onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))} className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm">
                    {[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Comment (optional)</label>
                <textarea rows={3} value={reviewForm.body} onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))} className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm" />
              </div>
              <button type="submit" disabled={reviewSubmitting} className="bg-black text-white text-xs font-semibold rounded-full px-5 py-2 hover:bg-gray-800 disabled:opacity-50">
                {reviewSubmitting ? "Submitting..." : "Submit review"}
              </button>
            </form>
          )}
        </section>

        {/* Related products */}
        {related.length > 0 && (
          <section className="max-w-5xl mx-auto px-5 py-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">You might also like</h2>
            <div className="flex gap-5 overflow-x-auto pb-2">
              {related.map((r) => (
                <div key={r.id} className="min-w-[220px] max-w-[220px]">
                  <ProductCard product={r} />
                </div>
              ))}
            </div>
          </section>
        )}

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
