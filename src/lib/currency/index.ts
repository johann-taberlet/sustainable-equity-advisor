/**
 * Currency conversion utilities using Frankfurter API
 * https://www.frankfurter.app/
 */

export type Currency = "CHF" | "USD" | "EUR";

// Re-export context and hook
export { CurrencyProvider, useCurrency } from "./context";

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] =
  [
    { value: "CHF", label: "CHF", symbol: "CHF" },
    { value: "USD", label: "USD", symbol: "$" },
    { value: "EUR", label: "EUR", symbol: "€" },
  ];

interface ExchangeRates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

// Cache exchange rates for 1 hour
let cachedRates: ExchangeRates | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Fetch exchange rates from Frankfurter API
 * Base currency is USD (what FMP returns)
 */
export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();

  // Return cached rates if still valid
  if (cachedRates && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedRates;
  }

  try {
    const response = await fetch(
      "https://api.frankfurter.app/latest?from=USD&to=CHF,EUR",
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.status}`);
    }

    const data = await response.json();

    // Add USD to rates (1:1 since USD is base)
    cachedRates = {
      base: "USD",
      date: data.date,
      rates: {
        USD: 1,
        CHF: data.rates.CHF,
        EUR: data.rates.EUR,
      },
    };
    cacheTimestamp = now;

    return cachedRates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);

    // Return fallback rates if API fails
    return {
      base: "USD",
      date: new Date().toISOString().split("T")[0],
      rates: {
        USD: 1,
        CHF: 0.88,
        EUR: 0.92,
      },
    };
  }
}

/**
 * Convert amount from USD to target currency
 */
export function convertFromUSD(
  amountUSD: number,
  targetCurrency: Currency,
  rates: Record<string, number>,
): number {
  const rate = rates[targetCurrency] || 1;
  return amountUSD * rate;
}

/**
 * Format currency value for display
 */
export function formatCurrency(
  amount: number,
  currency: Currency,
  locale = "en-CH",
): string {
  const currencyInfo = CURRENCIES.find((c) => c.value === currency);
  const _symbol = currencyInfo?.symbol || currency;

  // Format number with appropriate decimal places
  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Use symbol for USD/EUR, code for CHF
  if (currency === "USD") {
    return `$${formatted}`;
  } else if (currency === "EUR") {
    return `€${formatted}`;
  }
  return `CHF ${formatted}`;
}
