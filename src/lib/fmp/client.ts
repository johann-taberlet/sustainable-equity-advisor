/**
 * Financial Modeling Prep (FMP) API Client
 * Handles ESG data fetching with caching and mock fallback
 *
 * API Docs: https://site.financialmodelingprep.com/developer/docs/stable/esg-ratings
 */

import { normalizeNumericScore } from "./normalize";

// Check if we should use mock data (for tests or when no API key)
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

// Mock ESG data for demo/testing when API unavailable
const mockESGData: Record<string, ESGData> = {
  AAPL: {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    esgScore: 72,
    environmentalScore: 68,
    socialScore: 75,
    governanceScore: 73,
    lastUpdated: new Date().toISOString(),
  },
  MSFT: {
    symbol: "MSFT",
    companyName: "Microsoft Corporation",
    esgScore: 85,
    environmentalScore: 82,
    socialScore: 88,
    governanceScore: 85,
    lastUpdated: new Date().toISOString(),
  },
  NVDA: {
    symbol: "NVDA",
    companyName: "NVIDIA Corporation",
    esgScore: 68,
    environmentalScore: 65,
    socialScore: 70,
    governanceScore: 69,
    lastUpdated: new Date().toISOString(),
  },
  "NESN.SW": {
    symbol: "NESN.SW",
    companyName: "Nestlé S.A.",
    esgScore: 78,
    environmentalScore: 75,
    socialScore: 80,
    governanceScore: 79,
    lastUpdated: new Date().toISOString(),
  },
  ASML: {
    symbol: "ASML",
    companyName: "ASML Holding N.V.",
    esgScore: 81,
    environmentalScore: 78,
    socialScore: 83,
    governanceScore: 82,
    lastUpdated: new Date().toISOString(),
  },
  "VWS.CO": {
    symbol: "VWS.CO",
    companyName: "Vestas Wind Systems A/S",
    esgScore: 88,
    environmentalScore: 92,
    socialScore: 85,
    governanceScore: 87,
    lastUpdated: new Date().toISOString(),
  },
  "NOVN.SW": {
    symbol: "NOVN.SW",
    companyName: "Novartis AG",
    esgScore: 76,
    environmentalScore: 72,
    socialScore: 78,
    governanceScore: 78,
    lastUpdated: new Date().toISOString(),
  },
  "SU.PA": {
    symbol: "SU.PA",
    companyName: "Schneider Electric SE",
    esgScore: 84,
    environmentalScore: 86,
    socialScore: 82,
    governanceScore: 84,
    lastUpdated: new Date().toISOString(),
  },
  TSM: {
    symbol: "TSM",
    companyName: "Taiwan Semiconductor Manufacturing",
    esgScore: 71,
    environmentalScore: 68,
    socialScore: 73,
    governanceScore: 72,
    lastUpdated: new Date().toISOString(),
  },
  "ULVR.L": {
    symbol: "ULVR.L",
    companyName: "Unilever PLC",
    esgScore: 82,
    environmentalScore: 80,
    socialScore: 84,
    governanceScore: 82,
    lastUpdated: new Date().toISOString(),
  },
  "ORSTED.CO": {
    symbol: "ORSTED.CO",
    companyName: "Ørsted A/S",
    esgScore: 91,
    environmentalScore: 95,
    socialScore: 88,
    governanceScore: 90,
    lastUpdated: new Date().toISOString(),
  },
  FSLR: {
    symbol: "FSLR",
    companyName: "First Solar, Inc.",
    esgScore: 79,
    environmentalScore: 85,
    socialScore: 74,
    governanceScore: 78,
    lastUpdated: new Date().toISOString(),
  },
};

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
 * Get mock ESG data for a symbol
 */
function getMockESGData(symbol: string): ESGData | null {
  return mockESGData[symbol] || mockESGData[symbol.toUpperCase()] || null;
}

/**
 * Fetch ESG data from FMP API
 * Falls back to mock data if API unavailable or no key
 */
export async function fetchESGData(symbol: string): Promise<ESGData | null> {
  // Check cache first
  const cached = getCachedESGData(symbol);
  if (cached) {
    return cached;
  }

  // Use mock data if explicitly set (for tests) or no API key
  const apiKey = process.env.FMP_API_KEY;

  if (USE_MOCK_FMP || !apiKey) {
    const mockData = getMockESGData(symbol);
    if (mockData) {
      setCachedESGData(symbol, mockData);
      return mockData;
    }
    return null;
  }

  try {
    // FMP ESG Ratings endpoint (stable API)
    // Docs: https://site.financialmodelingprep.com/developer/docs/stable/esg-ratings
    const response = await fetch(
      `${FMP_BASE_URL}/esg-ratings?symbol=${encodeURIComponent(symbol)}&apikey=${apiKey}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );

    if (!response.ok) {
      console.warn(`FMP API error for ${symbol}: ${response.status}`);
      // Fallback to mock data
      const mockData = getMockESGData(symbol);
      if (mockData) {
        setCachedESGData(symbol, mockData);
        return mockData;
      }
      return null;
    }

    const data = await response.json();

    // Handle different response formats
    const fmpData = Array.isArray(data) ? data[0] : data;

    if (!fmpData) {
      // Fallback to mock data
      const mockData = getMockESGData(symbol);
      if (mockData) {
        setCachedESGData(symbol, mockData);
        return mockData;
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
        "FMP"
      ),
      environmentalScore: normalizeNumericScore(
        fmpData.environmentalScore ?? fmpData.environmental,
        "FMP"
      ),
      socialScore: normalizeNumericScore(
        fmpData.socialScore ?? fmpData.social,
        "FMP"
      ),
      governanceScore: normalizeNumericScore(
        fmpData.governanceScore ?? fmpData.governance,
        "FMP"
      ),
      lastUpdated: fmpData.date || fmpData.lastUpdated || new Date().toISOString(),
    };

    setCachedESGData(symbol, esgData);
    return esgData;
  } catch (error) {
    console.error(`Error fetching ESG data for ${symbol}:`, error);
    // Fallback to mock data
    const mockData = getMockESGData(symbol);
    if (mockData) {
      setCachedESGData(symbol, mockData);
      return mockData;
    }
    return null;
  }
}

/**
 * Fetch ESG data for multiple symbols
 */
export async function fetchESGDataBatch(
  symbols: string[]
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
 * Check if symbol has ESG data available
 */
export function hasESGData(symbol: string): boolean {
  return (
    getCachedESGData(symbol) !== null ||
    symbol in mockESGData ||
    symbol.toUpperCase() in mockESGData
  );
}

/**
 * Get all available mock symbols (for demo purposes)
 */
export function getAvailableSymbols(): string[] {
  return Object.keys(mockESGData);
}

// Quote cache (shorter TTL for prices)
const quoteCache = new Map<string, { data: StockQuote; expiresAt: number }>();
const QUOTE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes for prices

/**
 * Fetch real-time stock quote from FMP API
 */
export async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
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
      { next: { revalidate: 300 } } // Cache for 5 minutes
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
export async function fetchStockInfo(symbol: string): Promise<StockInfo | null> {
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
