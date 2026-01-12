"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CURRENCIES, type Currency } from "./index";

const STORAGE_KEY = "currency_preference";
const RATES_STORAGE_KEY = "exchange_rates_cache";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
  date: string;
}

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  exchangeRates: Record<string, number>;
  exchangeRate: number;
  formatAmount: (amountUSD: number, decimals?: number) => string;
  convertAmount: (amountUSD: number) => number;
  isLoading: boolean;
  lastUpdated: Date | null;
  refreshRates: () => Promise<void>;
}

const defaultRates: Record<string, number> = {
  USD: 1,
  CHF: 0.88,
  EUR: 0.92,
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("CHF");
  const [exchangeRates, setExchangeRates] =
    useState<Record<string, number>>(defaultRates);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load saved currency preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && ["CHF", "USD", "EUR"].includes(saved)) {
      setCurrencyState(saved as Currency);
    }
  }, []);

  // Save currency preference to localStorage
  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem(STORAGE_KEY, c);
  }, []);

  // Fetch exchange rates with localStorage caching
  const fetchRates = useCallback(async (forceRefresh = false) => {
    // Check localStorage cache first
    if (!forceRefresh) {
      const cached = localStorage.getItem(RATES_STORAGE_KEY);
      if (cached) {
        try {
          const data: CachedRates = JSON.parse(cached);
          const age = Date.now() - data.timestamp;
          if (age < CACHE_TTL_MS) {
            setExchangeRates(data.rates);
            setLastUpdated(new Date(data.timestamp));
            setIsLoading(false);
            return;
          }
        } catch {
          // Invalid cache, will fetch fresh
        }
      }
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://api.frankfurter.app/latest?from=USD&to=CHF,EUR",
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch exchange rates: ${response.status}`);
      }

      const data = await response.json();
      const rates = {
        USD: 1,
        CHF: data.rates.CHF,
        EUR: data.rates.EUR,
      };

      // Cache to localStorage
      const cacheData: CachedRates = {
        rates,
        timestamp: Date.now(),
        date: data.date,
      };
      localStorage.setItem(RATES_STORAGE_KEY, JSON.stringify(cacheData));

      setExchangeRates(rates);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      // Keep using current rates (or defaults)
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch rates on mount
  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  // Current exchange rate for selected currency
  const exchangeRate = useMemo(
    () => exchangeRates[currency] || 1,
    [exchangeRates, currency],
  );

  // Convert USD amount to current currency
  const convertAmount = useCallback(
    (amountUSD: number) => amountUSD * exchangeRate,
    [exchangeRate],
  );

  // Format amount in current currency
  const formatAmount = useCallback(
    (amountUSD: number, decimals = 0) => {
      const converted = amountUSD * exchangeRate;
      const currencyInfo = CURRENCIES.find((c) => c.value === currency);
      const _symbol = currencyInfo?.symbol || currency;

      const formatted = converted.toLocaleString("en-CH", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });

      if (currency === "USD") {
        return `$${formatted}`;
      } else if (currency === "EUR") {
        return `€${formatted}`;
      }
      return `CHF ${formatted}`;
    },
    [exchangeRate, currency],
  );

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      exchangeRates,
      exchangeRate,
      formatAmount,
      convertAmount,
      isLoading,
      lastUpdated,
      refreshRates: () => fetchRates(true),
    }),
    [
      currency,
      setCurrency,
      exchangeRates,
      exchangeRate,
      formatAmount,
      convertAmount,
      isLoading,
      lastUpdated,
      fetchRates,
    ],
  );

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}
