/**
 * Portfolio Data Model Types
 * Defines TypeScript types for portfolio management
 */

/**
 * Individual stock holding in a portfolio
 */
export interface Holding {
  /** Unique identifier for the holding */
  id?: string;
  /** Stock ticker symbol (e.g., AAPL, MSFT) */
  symbol: string;
  /** Company name */
  name: string;
  /** Number of shares owned */
  shares: number;
  /** Total market value in portfolio currency */
  value: number;
  /** Cost basis per share (original purchase price) */
  costBasis?: number;
  /** Weight in portfolio as percentage (0-100) */
  weight?: number;
  /** Current ESG score (0-100) */
  esgScore: number;
  /** Environmental score component (0-100) */
  environmentalScore?: number;
  /** Social score component (0-100) */
  socialScore?: number;
  /** Governance score component (0-100) */
  governanceScore?: number;
  /** Daily price change percentage */
  change?: number;
  /** Sector classification */
  sector?: string;
  /** Geographic region */
  region?: string;
  /** Date when holding was added */
  addedAt?: Date;
}

/**
 * Portfolio aggregate values
 */
export interface Portfolio {
  /** Unique identifier for the portfolio */
  id?: string;
  /** Portfolio display name */
  name: string;
  /** Portfolio currency (e.g., CHF, USD, EUR) */
  currency: string;
  /** Total portfolio market value */
  totalValue: number;
  /** Daily change in value */
  dailyChange: number;
  /** Daily change percentage */
  dailyChangePercent: number;
  /** List of holdings */
  holdings: Holding[];
  /** Aggregate ESG score */
  esgScore: number;
  /** Aggregate Environmental score */
  environmentalScore: number;
  /** Aggregate Social score */
  socialScore: number;
  /** Aggregate Governance score */
  governanceScore: number;
  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Portfolio summary for dashboard display
 */
export interface PortfolioSummary {
  totalValue: number;
  currency: string;
  dailyChange: number;
  dailyChangePercent: number;
  esgScore: number;
  holdingsCount: number;
}

/**
 * Benchmark data for comparison
 */
export interface Benchmark {
  /** Benchmark identifier (e.g., MSCI_ESG_LEADERS) */
  id: string;
  /** Benchmark display name */
  name: string;
  /** Benchmark ESG score */
  esgScore: number;
  /** Daily change percentage */
  dailyChangePercent: number;
  /** YTD return percentage */
  ytdReturn?: number;
}

/**
 * Portfolio allocation breakdown by category
 */
export interface AllocationBreakdown {
  /** Category label (e.g., "Technology", "US") */
  label: string;
  /** Allocation value */
  value: number;
  /** Allocation percentage */
  percentage: number;
  /** Average ESG score for this category */
  avgEsgScore?: number;
}

/**
 * Portfolio sector allocation
 */
export interface SectorAllocation extends AllocationBreakdown {
  /** Sector name */
  sector: string;
}

/**
 * Portfolio regional allocation
 */
export interface RegionAllocation extends AllocationBreakdown {
  /** Region name */
  region: string;
}

/**
 * Transaction record for portfolio changes
 */
export interface PortfolioTransaction {
  id: string;
  type: "buy" | "sell" | "dividend" | "split";
  symbol: string;
  shares: number;
  price: number;
  total: number;
  timestamp: Date;
}

/**
 * Calculate portfolio aggregate values from holdings
 */
export function calculatePortfolioAggregates(holdings: Holding[]): {
  totalValue: number;
  esgScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
} {
  if (holdings.length === 0) {
    return {
      totalValue: 0,
      esgScore: 0,
      environmentalScore: 0,
      socialScore: 0,
      governanceScore: 0,
    };
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  // Value-weighted ESG scores
  const weightedESG = holdings.reduce(
    (sum, h) => sum + h.esgScore * h.value,
    0,
  );
  const esgScore = Math.round(weightedESG / totalValue);

  // E, S, G components (simple average for now)
  const holdingsWithE = holdings.filter((h) => h.environmentalScore);
  const holdingsWithS = holdings.filter((h) => h.socialScore);
  const holdingsWithG = holdings.filter((h) => h.governanceScore);

  const environmentalScore =
    holdingsWithE.length > 0
      ? Math.round(
          holdingsWithE.reduce(
            (sum, h) => sum + (h.environmentalScore || 0),
            0,
          ) / holdingsWithE.length,
        )
      : 0;

  const socialScore =
    holdingsWithS.length > 0
      ? Math.round(
          holdingsWithS.reduce((sum, h) => sum + (h.socialScore || 0), 0) /
            holdingsWithS.length,
        )
      : 0;

  const governanceScore =
    holdingsWithG.length > 0
      ? Math.round(
          holdingsWithG.reduce((sum, h) => sum + (h.governanceScore || 0), 0) /
            holdingsWithG.length,
        )
      : 0;

  return {
    totalValue,
    esgScore,
    environmentalScore,
    socialScore,
    governanceScore,
  };
}

/**
 * Calculate holding weights based on portfolio value
 */
export function calculateHoldingWeights(holdings: Holding[]): Holding[] {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  if (totalValue === 0) return holdings;

  return holdings.map((h) => ({
    ...h,
    weight: Math.round((h.value / totalValue) * 100 * 10) / 10, // One decimal place
  }));
}

/**
 * Calculate sector allocation breakdown
 */
export function calculateSectorAllocation(
  holdings: Holding[],
): SectorAllocation[] {
  const sectorMap = new Map<
    string,
    { value: number; esgSum: number; count: number }
  >();

  for (const holding of holdings) {
    const sector = holding.sector || "Other";
    const existing = sectorMap.get(sector) || { value: 0, esgSum: 0, count: 0 };
    sectorMap.set(sector, {
      value: existing.value + holding.value,
      esgSum: existing.esgSum + holding.esgScore,
      count: existing.count + 1,
    });
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return Array.from(sectorMap.entries())
    .map(([sector, data]) => ({
      label: sector,
      sector,
      value: data.value,
      percentage:
        totalValue > 0
          ? Math.round((data.value / totalValue) * 100 * 10) / 10
          : 0,
      avgEsgScore: Math.round(data.esgSum / data.count),
    }))
    .sort((a, b) => b.value - a.value);
}
