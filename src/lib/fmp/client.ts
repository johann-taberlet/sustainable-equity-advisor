/**
 * Financial Modeling Prep (FMP) API Client
 * Handles ESG data fetching with caching and curated data fallback
 *
 * API Docs: https://site.financialmodelingprep.com/developer/docs/stable/esg-ratings
 */

import {
  type CuratedESGData,
  getCuratedESGData,
  getAvailableSymbols as getCuratedSymbols,
} from "@/lib/esg/curated-data";
import { normalizeNumericScore } from "./normalize";

// Check if we should use curated data (for tests or when no API key)
const USE_MOCK_FMP = process.env.USE_MOCK_FMP === "true";

// FMP API configuration
const FMP_BASE_URL = "https://financialmodelingprep.com/stable";

export interface ESGData {
  symbol: string;
  companyName: string;
  esgScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  lastUpdated: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number | null;
  exchange: string;
}

export interface StockInfo {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  exchange: string;
  marketCap: number;
  pe: number | null;
  esgScore: number | null;
  environmentalScore: number | null;
  socialScore: number | null;
  governanceScore: number | null;
}

// In-memory cache (in production, use Redis or Supabase esg_cache table)
const esgCache = new Map<string, { data: ESGData; expiresAt: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached ESG data or fetch from API
 */
function getCachedESGData(symbol: string): ESGData | null {
  const cached = esgCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }
  return null;
}

/**
 * Store ESG data in cache
 */
function setCachedESGData(symbol: string, data: ESGData): void {
  esgCache.set(symbol, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

/**
 * Convert curated data to ESGData format
 */
function curatedToESGData(curated: CuratedESGData): ESGData {
  return {
    symbol: curated.symbol,
    companyName: curated.companyName,
    esgScore: curated.esgScore,
    environmentalScore: curated.environmentalScore,
    socialScore: curated.socialScore,
    governanceScore: curated.governanceScore,
    lastUpdated: curated.lastUpdated,
  };
}

/**
 * Get ESG data from curated dataset (fallback when API unavailable)
 */
function getCuratedData(symbol: string): ESGData | null {
  const curated = getCuratedESGData(symbol);
  return curated ? curatedToESGData(curated) : null;
}

/**
 * Fetch ESG data from FMP API
 * Falls back to curated dataset if API unavailable or no key
 */
export async function fetchESGData(symbol: string): Promise<ESGData | null> {
  // Check cache first
  const cached = getCachedESGData(symbol);
  if (cached) {
    return cached;
  }

  // Use curated data if explicitly set (for tests) or no API key
  const apiKey = process.env.FMP_API_KEY;

  if (USE_MOCK_FMP || !apiKey) {
    const curatedData = getCuratedData(symbol);
    if (curatedData) {
      setCachedESGData(symbol, curatedData);
      return curatedData;
    }
    return null;
  }

  try {
    // FMP ESG Ratings endpoint (stable API)
    // Docs: https://site.financialmodelingprep.com/developer/docs/stable/esg-ratings
    const url = `${FMP_BASE_URL}/esg-ratings?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`;

    const response = await fetch(url, { next: { revalidate: 86400 } });

    if (!response.ok) {
      // ESG endpoint may require paid plan or symbol not found
      // Fall back to curated data
      const curatedData = getCuratedData(symbol);
      if (curatedData) {
        setCachedESGData(symbol, curatedData);
        return curatedData;
      }
      return null;
    }

    const data = await response.json();

    // Handle different response formats
    const fmpData = Array.isArray(data) ? data[0] : data;

    if (!fmpData) {
      // Fallback to curated data
      const curatedData = getCuratedData(symbol);
      if (curatedData) {
        setCachedESGData(symbol, curatedData);
        return curatedData;
      }
      return null;
    }

    // Normalize FMP response to our format using the normalization module
    // FMP stable API may use different field names
    const esgData: ESGData = {
      symbol: fmpData.symbol || symbol,
      companyName: fmpData.companyName || fmpData.company || symbol,
      esgScore: normalizeNumericScore(
        fmpData.ESGScore ?? fmpData.esgScore ?? fmpData.totalEsg,
        "FMP",
      ),
      environmentalScore: normalizeNumericScore(
        fmpData.environmentalScore ?? fmpData.environmental,
        "FMP",
      ),
      socialScore: normalizeNumericScore(
        fmpData.socialScore ?? fmpData.social,
        "FMP",
      ),
      governanceScore: normalizeNumericScore(
        fmpData.governanceScore ?? fmpData.governance,
        "FMP",
      ),
      lastUpdated:
        fmpData.date || fmpData.lastUpdated || new Date().toISOString(),
    };

    setCachedESGData(symbol, esgData);
    return esgData;
  } catch (error) {
    console.error(`Error fetching ESG data for ${symbol}:`, error);
    // Fallback to curated data
    const curatedData = getCuratedData(symbol);
    if (curatedData) {
      setCachedESGData(symbol, curatedData);
      return curatedData;
    }
    return null;
  }
}

/**
 * Fetch ESG data for multiple symbols
 */
export async function fetchESGDataBatch(
  symbols: string[],
): Promise<Map<string, ESGData>> {
  const results = new Map<string, ESGData>();

  // Fetch in parallel
  const promises = symbols.map(async (symbol) => {
    const data = await fetchESGData(symbol);
    if (data) {
      results.set(symbol, data);
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Check if symbol has ESG data available (in cache or curated dataset)
 */
export function hasESGData(symbol: string): boolean {
  return getCachedESGData(symbol) !== null || getCuratedData(symbol) !== null;
}

/**
 * Get all available symbols from curated dataset
 */
export function getAvailableSymbols(): string[] {
  return getCuratedSymbols();
}

// Quote cache (shorter TTL for prices)
const quoteCache = new Map<string, { data: StockQuote; expiresAt: number }>();
const QUOTE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes for prices

/**
 * Fetch real-time stock quote from FMP API
 */
export async function fetchStockQuote(
  symbol: string,
): Promise<StockQuote | null> {
  // Check cache first
  const cached = quoteCache.get(symbol);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    console.warn("FMP_API_KEY not set, cannot fetch stock quote");
    return null;
  }

  try {
    const response = await fetch(
      `${FMP_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
      { next: { revalidate: 300 } }, // Cache for 5 minutes
    );

    if (!response.ok) {
      console.warn(`FMP quote API error for ${symbol}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const quote = Array.isArray(data) ? data[0] : data;

    if (!quote || !quote.price) {
      console.warn(`No quote data for ${symbol}`);
      return null;
    }

    const stockQuote: StockQuote = {
      symbol: quote.symbol || symbol,
      name: quote.name || quote.companyName || symbol,
      price: quote.price || 0,
      change: quote.change || 0,
      changePercent: quote.changesPercentage || quote.changePercent || 0,
      volume: quote.volume || 0,
      marketCap: quote.marketCap || 0,
      pe: quote.pe || null,
      exchange: quote.exchange || quote.exchangeShortName || "",
    };

    quoteCache.set(symbol, {
      data: stockQuote,
      expiresAt: Date.now() + QUOTE_CACHE_TTL_MS,
    });

    return stockQuote;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch complete stock info (quote + ESG) for any symbol
 * This is used for looking up stocks not in portfolio
 */
export async function fetchStockInfo(
  symbol: string,
): Promise<StockInfo | null> {
  // Fetch quote and ESG in parallel
  const [quote, esg] = await Promise.all([
    fetchStockQuote(symbol),
    fetchESGData(symbol),
  ]);

  if (!quote) {
    return null;
  }

  return {
    symbol: quote.symbol,
    name: quote.name,
    price: quote.price,
    change: quote.change,
    changePercent: quote.changePercent,
    currency: "USD", // FMP returns USD prices by default
    exchange: quote.exchange,
    marketCap: quote.marketCap,
    pe: quote.pe,
    esgScore: esg?.esgScore || null,
    environmentalScore: esg?.environmentalScore || null,
    socialScore: esg?.socialScore || null,
    governanceScore: esg?.governanceScore || null,
  };
}
