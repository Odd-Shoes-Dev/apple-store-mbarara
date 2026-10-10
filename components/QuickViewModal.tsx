import { Fragment, FunctionComponent, useContext, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";
import CartContext from "./context/CartContext";
import { useDisplayCurrency } from "./context/DisplayCurrencyContext";
import {
  getProductDescription,
  getProductImage,
  getProductName,
  getProductPrice,
} from "../utils/computed";
import { CONDITION_LABELS, Product } from "../server/domain/types";

type Props = {
  product: Product | null;
  onClose: () => void;
};

const QuickViewModal: FunctionComponent<Props> = ({ product, onClose }) => {
  const { add } = useContext(CartContext);
  const { formatProductPrice } = useDisplayCurrency();

  // Keep rendering the last product while the panel plays its leave
  // transition, instead of popping empty the instant `product` clears.
  const [displayProduct, setDisplayProduct] = useState<Product | null>(null);
  useEffect(() => {
    if (product) setDisplayProduct(product);
  }, [product]);

  const outOfStock = displayProduct?.stockCount === 0;
  const lowStock = displayProduct ? displayProduct.stockCount > 0 && displayProduct.stockCount <= 3 : false;
  const isOnSale =
    displayProduct?.originalPriceCents != null && displayProduct.originalPriceCents > displayProduct.priceCents;

  const addToCart = () => {
    if (add && displayProduct && !outOfStock) add(displayProduct);
  };

  return (
    <Transition show={product !== null} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-[1200]">
        <Transition.Child
          as={Fragment}
          enter="duration-200 ease-out"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="duration-150 ease-in"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-end sm:items-center justify-center">
          <Transition.Child
            as={Fragment}
            enter="duration-250 ease-out"
            enterFrom="translate-y-full opacity-0 sm:translate-y-4"
            enterTo="translate-y-0 opacity-100"
            leave="duration-200 ease-in"
            leaveFrom="translate-y-0 opacity-100"
            leaveTo="translate-y-full opacity-0 sm:translate-y-4"
          >
            <Dialog.Panel className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl sm:m-4 shadow-xl max-h-[88vh] overflow-y-auto relative">
              {displayProduct && (
                <>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-gray-900"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <line x1="5" y1="5" x2="19" y2="19" />
                      <line x1="19" y1="5" x2="5" y2="19" />
                    </svg>
                  </button>

                  {/* Drag handle — mobile bottom sheet only */}
                  <div className="sm:hidden flex justify-center pt-3">
                    <div className="w-10 h-1.5 rounded-full bg-gray-300" />
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="h-48 flex items-center justify-center mb-4">
                      <LazyLoadImage
                        src={getProductImage(displayProduct)}
                        alt={getProductDescription(displayProduct)}
                        className={`max-h-full max-w-full object-contain ${outOfStock ? "opacity-50" : ""}`}
                      />
                    </div>

                    {displayProduct.category && (
                      <p className="text-xs font-mono uppercase tracking-widest text-gray-400">
                        {displayProduct.category.name}
                      </p>
                    )}

                    <Dialog.Title className="text-xl font-bold text-gray-900 mt-1">
                      {getProductName(displayProduct)}
                    </Dialog.Title>

                    {displayProduct.condition !== "brand_new" && (
                      <span className="mt-2 inline-block text-[0.65rem] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {CONDITION_LABELS[displayProduct.condition]}
                      </span>
                    )}

                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                      {getProductDescription(displayProduct)}
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatProductPrice(getProductPrice(displayProduct), displayProduct.currency)}
                      </span>
                      {isOnSale && displayProduct.originalPriceCents && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatProductPrice(displayProduct.originalPriceCents / 100, displayProduct.currency)}
                        </span>
                      )}
                    </div>

                    {lowStock && (
                      <p className="text-amber-600 text-sm font-medium mt-2">
                        Only {displayProduct.stockCount} left in stock
                      </p>
                    )}

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                      {displayProduct.isAuthentic && <span>Genuine / Authentic</span>}
                      {displayProduct.warrantyMonths && <span>{displayProduct.warrantyMonths}-month warranty</span>}
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                      <button
                        onClick={addToCart}
                        disabled={outOfStock}
                        className="w-full bg-black text-white rounded-full py-3 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {outOfStock ? "Out of stock" : "Add to bag"}
                      </button>
                      <Link href={`/products/${displayProduct.id}`} passHref>
                        <a className="w-full text-center text-sm font-semibold text-blue-600 hover:underline py-1">
                          View full details
                        </a>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default QuickViewModal;
