import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Currency, DEFAULT_CURRENCY } from "../../server/domain/types";
import { convertAmount, formatCurrency } from "../../utils/currency";

type DisplayCurrencyContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rate: number | null;
  formatProductPrice: (amountMajorUnits: number, nativeCurrency: Currency) => string;
};

const DisplayCurrencyContext = createContext<DisplayCurrencyContextValue>({
  currency: DEFAULT_CURRENCY,
  setCurrency: () => {},
  rate: null,
  formatProductPrice: (amount, nativeCurrency) => formatCurrency(amount, nativeCurrency),
});

export const useDisplayCurrency = () => useContext(DisplayCurrencyContext);

const STORAGE_KEY = "display_currency";

export function DisplayCurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [rate, setRate] = useState<number | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "ugx" || stored === "usd") {
        setCurrencyState(stored);
      }
    } catch {
      // localStorage unavailable — fall back to the default silently.
    }
  }, []);

  useEffect(() => {
    fetch("/api/exchange-rate")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.rate === "number") setRate(data.rate);
      })
      .catch(() => {});
  }, []);

  const setCurrency = (next: Currency) => {
    setCurrencyState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  };

  const formatProductPrice = (amountMajorUnits: number, nativeCurrency: Currency) => {
    if (nativeCurrency === currency || rate === null) {
      return formatCurrency(amountMajorUnits, nativeCurrency);
    }
    const converted = convertAmount(amountMajorUnits, nativeCurrency, currency, rate);
    return formatCurrency(converted, currency);
  };

  return (
    <DisplayCurrencyContext.Provider value={{ currency, setCurrency, rate, formatProductPrice }}>
      {children}
    </DisplayCurrencyContext.Provider>
  );
}
