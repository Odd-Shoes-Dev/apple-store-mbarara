import { createContext, ReactElement } from "react";
import { Product } from "../../server/domain/types";

export type CartLine = {
  product: Product;
  quantity: number;
};

export type CartContextProps = {
  items?: CartLine[];
  remove?: (productID: string) => void;
  removeAll?: () => void;
  add?: (product: Product) => void;
  increment?: (productID: string) => void;
  decrement?: (productID: string) => void;
  alert?: ReactElement<any, any> | null;
  isAlertVisible?: boolean | undefined;
};

const cartContextProps: CartContextProps = {};

const CartContext = createContext(cartContextProps);

export default CartContext;
