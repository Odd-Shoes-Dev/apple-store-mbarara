import { FunctionComponent } from "react";
import Link from "next/link";
import { LazyLoadImage } from "react-lazy-load-image-component";
import {
  getProductPrice,
  formatPrice,
  getProductImage,
  getProductName,
} from "../utils/computed";
import { Product } from "../server/domain/types";

export type NewArrivalCardProps = {
  product: Product;
};

const NewArrivalCard: FunctionComponent<NewArrivalCardProps> = ({ product }) => {
  return (
    <Link href={`/products/${product.id}`} passHref>
      <a className="group relative block w-64 flex-none rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* NEW tag */}
        <span
          className="absolute top-4 left-4 z-10 text-[0.65rem] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
          style={{ background: "#c9a15a", color: "#000" }}
        >
          New
        </span>

        {/* Image */}
        <div className="h-60 flex items-center justify-center p-8 overflow-hidden bg-gray-50">
          <LazyLoadImage
            src={getProductImage(product)}
            alt={getProductName(product)}
            className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
          />
        </div>

        {/* Text */}
        <div className="px-5 pb-5 pt-4">
          {product.category && (
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400 mb-1">
              {product.category.name}
            </p>
          )}
          <h3 className="text-gray-900 font-bold text-lg leading-snug line-clamp-2">
            {getProductName(product)}
          </h3>

          <div className="flex items-center justify-between mt-3">
            <span className="text-gray-900 text-sm font-semibold">
              {formatPrice(getProductPrice(product))}
            </span>
            <span
              className="text-xs font-semibold flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-0.5"
              style={{ color: "#c9a15a" }}
            >
              View
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default NewArrivalCard;
