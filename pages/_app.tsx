import "../styles/globals.css";
import type { AppProps } from "next/app";
import CartContext, {
  CartContextProps,
} from "../components/context/CartContext";
import { useState, ReactElement } from "react";
import _ from "lodash";
import { Alert, Slide } from "@mui/material";
import { getProductPrice } from "../utils/computed";
import { Product } from "../server/domain/types";

function MyApp({ Component, pageProps }: AppProps) {
  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [alert, setAlert] = useState<ReactElement | null>(null);
  const [alertVisible, setAlertVisible] = useState<boolean | undefined>(false);

  function playSound(sound: string) {
    new Audio(`/sounds/${sound}`).play();
  }

  const remove = (productID: string) => {
    let i = _.reject(items, function (item) {
      return item.id === productID;
    });
    setItems(i);

    let item = items.filter((item) => item.id === productID);
    setTotal((prev) => prev - getProductPrice(item[0]));
  };

  const removeAll = () => {
    let i = _.reject(items);
    setItems(i);
    setTotal(0);
  };

  const add = (product: Product) => {
    const isProductInCart = items.some((item) => item.id === product.id);
    if (!isProductInCart) {
      let updatedItems = [...items, product];
      setItems(updatedItems);
      setAlert(
        <Alert
          style={{ fontSize: "1rem", padding: "0.5rem" }}
          severity="success"
        >
          Successfully added
        </Alert>
      );
      setAlertVisible(true);
      setTotal((prev) => prev + getProductPrice(product));
      playSound("notification-success.mp3");
    } else {
      setAlert(
        <Alert style={{ fontSize: "1rem", padding: "0.5rem" }} severity="info">
          Already added
        </Alert>
      );
      setAlertVisible(true);
      playSound("notification-warning.mp3");
    }

    setTimeout(() => {
      setAlert(null);
      setAlertVisible(false);
    }, 2000);
  };

  const cartContext: CartContextProps = {
    items: items,
    add: add,
    remove: remove,
    removeAll: removeAll,
    total: total,
    alert: alert,
    isAlertVisible: alertVisible,
  };

  return (
    <CartContext.Provider value={cartContext}>
      <Component {...pageProps} />
    </CartContext.Provider>
  );
}

export default MyApp;
