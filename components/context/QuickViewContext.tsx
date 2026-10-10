import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
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
  const router = useRouter();

  useEffect(() => {
    const close = () => setProduct(null);
    router.events.on("routeChangeStart", close);
    return () => {
      router.events.off("routeChangeStart", close);
    };
  }, [router]);

  return (
    <QuickViewContext.Provider value={{ openQuickView: setProduct }}>
      {children}
      <QuickViewModal product={product} onClose={() => setProduct(null)} />
    </QuickViewContext.Provider>
  );
}
