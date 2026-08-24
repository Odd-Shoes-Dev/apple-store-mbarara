import { FunctionComponent, useContext } from "react";
import CartContext from "./context/CartContext";
import {
  getProductPrice,
  getProductDescription,
  getProductImage,
  getProductName,
} from "../utils/computed";
import { LazyLoadImage } from "react-lazy-load-image-component";
import Link from "next/link";
import { Product } from "../server/domain/types";

export type CardProps = {
  product: Product;
};

const ProductCard: FunctionComponent<CardProps> = ({ product }) => {
  const { add } = useContext(CartContext);

  const addToCart = (p: Product) => {
    if (add) {
      add(p);
    }
  };

  return (
    <div className="w-[80%] md:w-[300px] shadow-lg lg:hover:scale-105 transition-transform duration-300 ease-out">
      <Link href={`/products/${product.id}`}>
        <div title="SEE THE PRODUCT" className="relative w-full cursor-pointer">
          {/* Image */}
          <div className="relative w-full h-72 rounded-lg overflow-hidden">
            <LazyLoadImage
              src={getProductImage(product)}
              alt={getProductDescription(product)}
              className="max-w-full min-h-full object-cover"
            />
            {/* Price */}
            <div
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-min w-min p-2 bg-gradient-to-t bg-[rgba(0,0,0,0.8)] rounded-md"
            >
              <p className="text-md font-bold text-white">
                ${getProductPrice(product)}
              </p>
            </div>
          </div>
          {/* Product Name */}
          <div className="relative mt-4">
            <h3 className="text-sm text-center pl-4 font-[600] text-[1rem] text-gray-900">
              {getProductName(product)}
            </h3>
          </div>
        </div>
      </Link>
      {/* Add to bag */}
      <div className="mt-4">
        <button
          onClick={() => addToCart(product)}
          className="relative w-full flex bg-gray-200 border border-transparent rounded-md py-2 px-8 items-center justify-center text-sm font-medium text-gray-900 hover:bg-gray-300 transition duration-300 ease-in-out transform lg:hover:scale-105 lg:active:bg-gray-400"
        >
          Add to bag
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
