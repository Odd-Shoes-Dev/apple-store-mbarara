import { FunctionComponent, useContext } from "react";
import CartContext from "./context/CartContext";
import {
  getProductPrice,
  formatPrice,
  getProductDescription,
  getProductImage,
  getProductName,
} from "../utils/computed";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Link from "next/link";
import { CONDITION_LABELS, Product } from "../server/domain/types";

export type CardProps = {
  product: Product;
};

const ProductCard: FunctionComponent<CardProps> = ({ product }) => {
  const { add } = useContext(CartContext);

  const outOfStock = product.stockCount === 0;
  const isOnSale =
    product.originalPriceCents !== null &&
    product.originalPriceCents > product.priceCents;

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (outOfStock) return;
    if (add) add(product);
  };

  return (
    <div className="w-full bg-gray-100 rounded-2xl p-6 flex flex-col transition-all duration-250 hover:-translate-y-1 hover:shadow-xl relative overflow-hidden">
      {/* NEW / SALE badge */}
      {product.isNewArrival && !isOnSale && (
        <span className="absolute top-3 left-3 z-10 bg-teal-500 text-white text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
          New
        </span>
      )}
      {isOnSale && (
        <span className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-[0.6rem] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
          Sale
        </span>
      )}

      {/* Out of stock ribbon */}
      {outOfStock && (
        <div className="absolute top-5 -right-6 z-10 bg-gray-500 text-white text-[0.6rem] font-bold uppercase tracking-wider px-8 py-0.5 rotate-45">
          Sold out
        </div>
      )}

      {/* Image + info */}
      <Link href={`/products/${product.id}`} passHref>
        <a className="flex flex-col flex-1">
          <div className="h-44 flex items-center justify-center mb-5">
            <LazyLoadImage
              src={getProductImage(product)}
              alt={getProductDescription(product)}
              className={`max-h-full max-w-full object-contain transition-opacity ${outOfStock ? "opacity-50" : ""}`}
            />
          </div>

          {/* Category label */}
          {product.category && (
            <span className="text-[0.68rem] font-mono uppercase tracking-widest text-gray-400">
              {product.category.name}
            </span>
          )}

          {/* Product name */}
          <h3 className="mt-1 text-base font-semibold text-gray-900 leading-snug">
            {getProductName(product)}
          </h3>

          {/* Condition chip */}
          {product.condition !== "brand_new" && (
            <span className="mt-1 inline-block self-start text-[0.65rem] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {CONDITION_LABELS[product.condition]}
            </span>
          )}

          {/* Description */}
          <p className="mt-1 text-sm text-gray-500 overflow-hidden whitespace-nowrap text-ellipsis">
            {getProductDescription(product)}
          </p>
        </a>
      </Link>

      {/* Footer: price + add to bag */}
      <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-200">
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-sm">
            {formatPrice(getProductPrice(product))}
          </span>
          {isOnSale && product.originalPriceCents && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPriceCents / 100)}
            </span>
          )}
        </div>
        <button
          onClick={addToCart}
          disabled={outOfStock}
          className="bg-black text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-blue-600 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-black"
        >
          {outOfStock ? "Sold out" : "Add to bag"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
