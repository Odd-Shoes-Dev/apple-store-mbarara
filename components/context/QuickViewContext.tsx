import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../../server/domain/types";
import QuickViewModal from "../QuickViewModal";

type QuickViewContextValue = {
  openQuickView: (product: Product) => void;
};

const QuickViewContext = createContext<QuickViewContextValue>({
  openQuickView: () => {},
});

export const useQuickView = () => useContext(QuickViewContext);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);

  return (
    <QuickViewContext.Provider value={{ openQuickView: setProduct }}>
      {children}
      <QuickViewModal product={product} onClose={() => setProduct(null)} />
    </QuickViewContext.Provider>
  );
}
