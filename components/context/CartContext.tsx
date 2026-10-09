import { createContext, ReactElement } from "react";
import { Product } from "../../server/domain/types";

export type CartContextProps = {
  items?: Product[];
  remove?: (productID: string) => void;
  removeAll?: () => void;
  add?: (product: Product) => void;
  alert?: ReactElement<any, any> | null;
  isAlertVisible?: boolean | undefined;
};

const cartContextProps: CartContextProps = {};

const CartContext = createContext(cartContextProps);

export default CartContext;
