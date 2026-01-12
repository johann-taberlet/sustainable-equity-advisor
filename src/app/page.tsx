"use client";

import { AlertTriangle, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import { AIPanel } from "@/components/ai/AIPanel";
import { Chat, type PortfolioAction } from "@/components/chat";
import { ESGDashboard } from "@/components/dashboard/ESGDashboard";
import { ESGScreening } from "@/components/dashboard/ESGScreening";
import {
  type HoldingsFilter,
  HoldingsTablePro,
} from "@/components/dashboard/HoldingsTablePro";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { type NavigationSection, Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getActiveAlerts,
  getOperatorText,
  type PriceAlert,
  shouldTrigger,
  updateAlertStatus,
} from "@/lib/alerts";
import { useCurrency } from "@/lib/currency";

interface ESGData {
  symbol: string;
  companyName: string;
  esgScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  controversyLevel?: number;
  lastUpdated: string;
}

interface Holding {
  symbol: string;
  name: string;
  shares: number;
  value: number;
  esgScore: number;
  environmentalScore?: number;
  socialScore?: number;
  governanceScore?: number;
  controversyLevel?: number; // 0-5, lower = better
  weight?: number;
  change?: number;
  sector: string;
}

// Sector colors for allocation chart
const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3b82f6",
  Consumer: "#10b981",
  Energy: "#f59e0b",
  Healthcare: "#ec4899",
  Industrial: "#8b5cf6",
  Financial: "#06b6d4",
  Utilities: "#84cc16",
};

function getESGColorClass(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getESGBgClass(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

// Demo portfolio for selector
const portfolios = [
  { id: "00000000-0000-0000-0000-000000000001", name: "Demo Portfolio" },
];

export default function Home() {
  const [activeSection, setActiveSection] =
    useState<NavigationSection>("dashboard");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(
    portfolios[0].id,
  );
  // Sample portfolio for demo - diverse sectors and ESG scores
  const [holdings, setHoldings] = useState<Holding[]>([
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      shares: 15,
      value: 15 * 175, // ~$2,625
      esgScore: 83,
      sector: "Technology",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corporation",
      shares: 10,
      value: 10 * 375, // ~$3,750
      esgScore: 87,
      sector: "Technology",
    },
    {
      symbol: "JNJ",
      name: "Johnson & Johnson",
      shares: 8,
      value: 8 * 155, // ~$1,240
      esgScore: 72,
      sector: "Healthcare",
    },
    {
      symbol: "XOM",
      name: "Exxon Mobil Corporation",
      shares: 5,
      value: 5 * 105, // ~$525 - lower ESG, controversy candidate
      esgScore: 45,
      sector: "Energy",
    },
    {
      symbol: "NEE",
      name: "NextEra Energy Inc.",
      shares: 12,
      value: 12 * 75, // ~$900 - clean energy leader
      esgScore: 91,
      sector: "Utilities",
    },
  ]); // Values stored in USD
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [holdingsFilter, setHoldingsFilter] = useState<HoldingsFilter | null>(
    null,
  );

  // Currency from context (reactive to changes)
  const { formatAmount } = useCurrency();

  // Fetch ESG data when holdings change
  useEffect(() => {
    if (holdings.length === 0) return;

    const fetchESGData = async () => {
      const symbols = holdings.map((h) => h.symbol).join(",");
      try {
        const response = await fetch(
          `/api/esg?symbols=${encodeURIComponent(symbols)}`,
        );
        if (response.ok) {
          const result = await response.json();
          setHoldings((prev) =>
            prev.map((holding) => {
              const esgData = result.data[holding.symbol] as ESGData | null;
              if (esgData) {
                return {
                  ...holding,
                  esgScore: esgData.esgScore,
                  environmentalScore: esgData.environmentalScore,
                  socialScore: esgData.socialScore,
                  governanceScore: esgData.governanceScore,
                  controversyLevel: esgData.controversyLevel,
                };
              }
              return holding;
            }),
          );
        }
      } catch (error) {
        console.error("Error fetching ESG data:", error);
      }
    };

    fetchESGData();
  }, [holdings.length, holdings.map]);

  // Fetch real stock price from API (returns USD)
  const fetchStockPrice = useCallback(
    async (symbol: string): Promise<{ price: number; name: string } | null> => {
      try {
        const response = await fetch(
          `/api/stock?symbol=${encodeURIComponent(symbol)}`,
        );
        if (!response.ok) return null;
        const data = await response.json();
        // Keep price in USD (base currency for storage)
        return {
          price: data.price,
          name: data.name || symbol,
        };
      } catch (error) {
        console.error("Error fetching stock price:", error);
        return null;
      }
    },
    [],
  );

  const handlePortfolioUpdate = useCallback(
    async (action: PortfolioAction) => {
      const { type, symbol, shares = 1, name } = action;

      if (type === "add_holding") {
        // Check if it's an existing holding first (synchronous update)
        const existingHolding = holdings.find((h) => h.symbol === symbol);
        if (existingHolding) {
          setHoldings((prev) => {
            const existingIndex = prev.findIndex((h) => h.symbol === symbol);
            const updated = [...prev];
            const existing = updated[existingIndex];
            const pricePerShare = existing.value / existing.shares;
            updated[existingIndex] = {
              ...existing,
              shares: existing.shares + shares,
              value: (existing.shares + shares) * pricePerShare,
            };
            return updated;
          });
          return;
        }

        // For new holdings, fetch real price from API
        const stockData = await fetchStockPrice(symbol);
        const pricePerShare = stockData?.price || 100; // Fallback to 100 CHF
        const stockName = stockData?.name || name || symbol;

        setHoldings((prev) => [
          ...prev,
          {
            symbol,
            name: stockName,
            shares,
            value: shares * pricePerShare,
            esgScore: 75,
            sector: "Technology",
          },
        ]);
      } else if (type === "remove_holding") {
        setHoldings((prev) => prev.filter((h) => h.symbol !== symbol));
      } else if (type === "update_holding") {
        setHoldings((prev) => {
          const existingIndex = prev.findIndex((h) => h.symbol === symbol);
          if (existingIndex >= 0 && shares !== undefined) {
            const updated = [...prev];
            const existing = updated[existingIndex];
            const pricePerShare = existing.value / existing.shares;
            updated[existingIndex] = {
              ...existing,
              shares,
              value: shares * pricePerShare,
            };
            return updated;
          }
          return prev;
        });
      } else if (type === "sell_holding") {
        setHoldings((prev) => {
          const existingIndex = prev.findIndex((h) => h.symbol === symbol);
          if (existingIndex >= 0 && shares !== undefined) {
            const updated = [...prev];
            const existing = updated[existingIndex];
            const newShares = existing.shares - shares;

            // If selling all or more shares, remove the position
            if (newShares <= 0) {
              return prev.filter((h) => h.symbol !== symbol);
            }

            // Otherwise, reduce the position
            const pricePerShare = existing.value / existing.shares;
            updated[existingIndex] = {
              ...existing,
              shares: newShares,
              value: newShares * pricePerShare,
            };
            return updated;
          }
          return prev;
        });
      }
    },
    [holdings, fetchStockPrice],
  );

  const getHoldingShares = useCallback(
    (symbol: string): number => {
      const holding = holdings.find((h) => h.symbol === symbol);
      return holding?.shares || 0;
    },
    [holdings],
  );

  const handleRemoveHolding = useCallback((symbol: string) => {
    setHoldings((prev) => prev.filter((h) => h.symbol !== symbol));
  }, []);

  const handleFilterHoldings = useCallback((filter: HoldingsFilter) => {
    setHoldingsFilter(filter);
    setActiveSection("holdings"); // Navigate to holdings to see results
    const filterDesc = [
      filter.sector && `sector: ${filter.sector}`,
      filter.minEsg && `ESG ≥ ${filter.minEsg}`,
      filter.maxEsg && `ESG ≤ ${filter.maxEsg}`,
    ]
      .filter(Boolean)
      .join(", ");
    toast.success(`Filter applied: ${filterDesc}`);
  }, []);

  const handleAlertCreated = useCallback((alert: PriceAlert) => {
    toast.success(
      `Alert created: ${alert.symbol} ${getOperatorText(alert.operator)} $${alert.targetPrice}`,
    );
  }, []);

  // Check for triggered alerts on mount
  useEffect(() => {
    const checkAlerts = async () => {
      const activeAlerts = getActiveAlerts();
      if (activeAlerts.length === 0) return;

      // Get unique symbols
      const symbols = [...new Set(activeAlerts.map((a) => a.symbol))];

      try {
        // Fetch current prices for all symbols
        for (const symbol of symbols) {
          const response = await fetch(
            `/api/stock?symbol=${encodeURIComponent(symbol)}`,
          );
          if (response.ok) {
            const data = await response.json();
            const currentPrice = data.price;

            // Check each alert for this symbol
            for (const alert of activeAlerts.filter(
              (a) => a.symbol === symbol,
            )) {
              if (shouldTrigger(alert, currentPrice)) {
                updateAlertStatus(alert.id, "triggered");
                toast.info(
                  `Price Alert: ${alert.symbol} is now ${getOperatorText(alert.operator)} $${alert.targetPrice} (current: $${currentPrice.toFixed(2)})`,
                  { duration: 10000 },
                );
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking alerts:", error);
      }
    };

    checkAlerts();
  }, []);

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const hasHoldings = holdings.length > 0;

  const avgESGScore =
    holdings.length > 0
      ? Math.round(
          holdings.reduce((sum, h) => sum + h.esgScore, 0) / holdings.length,
        )
      : 0;
  const avgEnvironmental =
    holdings.length > 0 && holdings.some((h) => h.environmentalScore)
      ? Math.round(
          holdings.reduce((sum, h) => sum + (h.environmentalScore || 0), 0) /
            holdings.filter((h) => h.environmentalScore).length,
        )
      : 0;
  const avgSocial =
    holdings.length > 0 && holdings.some((h) => h.socialScore)
      ? Math.round(
          holdings.reduce((sum, h) => sum + (h.socialScore || 0), 0) /
            holdings.filter((h) => h.socialScore).length,
        )
      : 0;
  const avgGovernance =
    holdings.length > 0 && holdings.some((h) => h.governanceScore)
      ? Math.round(
          holdings.reduce((sum, h) => sum + (h.governanceScore || 0), 0) /
            holdings.filter((h) => h.governanceScore).length,
        )
      : 0;

  // Top ESG contributors - sorted by weighted contribution to portfolio ESG
  const topESGContributors = useMemo(() => {
    if (holdings.length === 0 || totalValue === 0) return [];

    return holdings
      .map((h) => ({
        symbol: h.symbol,
        name: h.name,
        esgScore: h.esgScore,
        weight: (h.value / totalValue) * 100,
        contribution: (h.esgScore * h.value) / totalValue,
      }))
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 5);
  }, [holdings, totalValue]);

  // Holdings with controversy alerts (level >= 3)
  const controversyAlerts = useMemo(() => {
    return holdings
      .filter(
        (h) => h.controversyLevel !== undefined && h.controversyLevel >= 3,
      )
      .map((h) => ({
        symbol: h.symbol,
        name: h.name,
        level: h.controversyLevel as number,
        levelLabel:
          h.controversyLevel === 5
            ? "Severe"
            : h.controversyLevel === 4
              ? "High"
              : "Moderate",
      }))
      .sort((a, b) => b.level - a.level);
  }, [holdings]);

  const sectorAllocation = useMemo(() => {
    const sectorTotals: Record<string, number> = {};
    for (const holding of holdings) {
      sectorTotals[holding.sector] =
        (sectorTotals[holding.sector] || 0) + holding.value;
    }
    return Object.entries(sectorTotals).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalValue) * 100).toFixed(1),
    }));
  }, [holdings, totalValue]);

  // Generate sample performance data (simulated historical)
  const performanceData = useMemo(() => {
    const data = [];
    const today = new Date();
    const startValue = totalValue * 0.92; // Start 8% lower
    const benchmarkStart = startValue * 1.02;

    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Simulate gradual growth with some volatility
      const progress = (90 - i) / 90;
      const volatility = Math.sin(i * 0.3) * 0.02;
      const portfolioValue =
        startValue +
        (totalValue - startValue) * progress +
        totalValue * volatility;
      const benchmarkValue =
        benchmarkStart +
        benchmarkStart * 0.05 * progress +
        benchmarkStart * volatility * 0.5;

      data.push({
        date: date.toISOString().split("T")[0],
        value: Math.round(portfolioValue),
        benchmark: Math.round(benchmarkValue),
      });
    }
    return data;
  }, [totalValue]);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div data-testid="portfolio-content" className="space-y-3">
            <Card data-testid="portfolio-summary">
              <CardHeader className="pb-2">
                <CardTitle>Portfolio Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {hasHoldings ? (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                    {/* Left: Portfolio Value */}
                    <div>
                      <div
                        className="text-3xl font-bold"
                        data-testid="portfolio-value"
                      >
                        {formatAmount(totalValue)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total portfolio value
                      </p>
                    </div>

                    {/* Right: ESG Score */}
                    <div
                      className="flex flex-col items-end gap-2"
                      data-testid="esg-breakdown"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          ESG Score
                        </span>
                        <span
                          className="text-2xl font-bold"
                          data-testid="portfolio-esg"
                          data-esg-score={avgESGScore}
                        >
                          <span className={getESGColorClass(avgESGScore)}>
                            {avgESGScore}
                          </span>
                          <span className="text-muted-foreground text-lg">
                            /100
                          </span>
                        </span>
                      </div>
                      <div data-testid="esg-gauge" className="w-32">
                        <Progress
                          value={avgESGScore}
                          className={`h-2 ${getESGBgClass(avgESGScore)}`}
                        />
                      </div>
                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">E</span>
                          <span
                            className={`font-semibold ${getESGColorClass(avgEnvironmental)}`}
                            data-testid="e-score"
                          >
                            {avgEnvironmental || "–"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">S</span>
                          <span
                            className={`font-semibold ${getESGColorClass(avgSocial)}`}
                            data-testid="s-score"
                          >
                            {avgSocial || "–"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">G</span>
                          <span
                            className={`font-semibold ${getESGColorClass(avgGovernance)}`}
                            data-testid="g-score"
                          >
                            {avgGovernance || "–"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      No holdings yet. Use the AI chat to add stocks to your
                      portfolio.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try: "Add 10 shares of AAPL"
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {hasHoldings && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <div className="lg:col-span-2">
                    <PerformanceChart
                      data={performanceData}
                      showBenchmark
                      benchmarkLabel="MSCI ESG Leaders"
                    />
                  </div>

                  <Card data-testid="allocation-chart">
                    <CardHeader className="pb-2">
                      <CardTitle>Sector Allocation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={sectorAllocation}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={70}
                              paddingAngle={2}
                              dataKey="value"
                              nameKey="name"
                            >
                              {sectorAllocation.map((entry) => (
                                <Cell
                                  key={entry.name}
                                  fill={SECTOR_COLORS[entry.name] || "#6b7280"}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: number) => [
                                formatAmount(value),
                                "Value",
                              ]}
                            />
                            <Legend
                              wrapperStyle={{ fontSize: "12px" }}
                              formatter={(value) => (
                                <span className="text-xs">{value}</span>
                              )}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Third row: ESG Contributors + Controversy Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {/* Top ESG Contributors */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        Top ESG Contributors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {topESGContributors.map((item) => (
                          <div
                            key={item.symbol}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {item.symbol}
                              </span>
                              <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span
                                  className={`text-sm font-medium ${getESGColorClass(item.esgScore)}`}
                                >
                                  {item.esgScore}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">
                                  × {item.weight.toFixed(0)}%
                                </span>
                              </div>
                              <div className="w-12 text-right">
                                <span className="text-sm font-semibold text-foreground">
                                  {item.contribution.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Controversy Alerts */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Risk Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {controversyAlerts.length > 0 ? (
                        <div className="space-y-2">
                          {controversyAlerts.map((item) => (
                            <div
                              key={item.symbol}
                              className="flex items-center justify-between"
                            >
                              <span className="font-medium text-sm">
                                {item.symbol}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded ${
                                  item.level === 5
                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                    : item.level === 4
                                      ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                      : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                }`}
                              >
                                {item.levelLabel}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          No controversy alerts
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        );

      case "holdings":
        return (
          <div data-testid="holdings-content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Holdings</CardTitle>
              </CardHeader>
              <CardContent>
                <HoldingsTablePro
                  holdings={holdings}
                  onRemove={handleRemoveHolding}
                  filter={holdingsFilter}
                  onClearFilter={() => setHoldingsFilter(null)}
                />
              </CardContent>
            </Card>
          </div>
        );

      case "esg":
        return (
          <div data-testid="esg-content">
            <ESGDashboard
              holdings={holdings}
              portfolioScore={avgESGScore}
              environmentalScore={avgEnvironmental || undefined}
              socialScore={avgSocial || undefined}
              governanceScore={avgGovernance || undefined}
            />
          </div>
        );

      case "screening":
        return (
          <div data-testid="screening-content">
            <ESGScreening
              onAddToPortfolio={(symbol, shares, price, name, sector) => {
                // Check if already in portfolio
                const existing = holdings.find((h) => h.symbol === symbol);
                if (existing) {
                  // Add to existing position
                  const pricePerShare = existing.value / existing.shares;
                  setHoldings((prev) =>
                    prev.map((h) =>
                      h.symbol === symbol
                        ? {
                            ...h,
                            shares: h.shares + shares,
                            value: (h.shares + shares) * pricePerShare,
                          }
                        : h,
                    ),
                  );
                  toast.success(
                    `Added ${shares} share${shares > 1 ? "s" : ""} of ${symbol} to existing position`,
                  );
                } else {
                  // Add new holding with provided data
                  setHoldings((prev) => [
                    ...prev,
                    {
                      symbol,
                      name,
                      shares,
                      value: shares * price,
                      esgScore: 75, // Will be updated by ESG fetch effect
                      sector,
                    },
                  ]);
                  toast.success(
                    `Added ${shares} share${shares > 1 ? "s" : ""} of ${symbol} to portfolio`,
                  );
                }
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      sidebar={
        <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
      }
      header={
        <Header
          portfolios={portfolios}
          selectedPortfolioId={selectedPortfolioId}
          onPortfolioChange={setSelectedPortfolioId}
          onAIChatToggle={() => setAiPanelOpen((prev) => !prev)}
          isAIPanelOpen={aiPanelOpen}
        />
      }
      rightPanel={
        <AIPanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)}>
          <div data-testid="chat-content" className="h-full">
            <Chat
              onPortfolioUpdate={handlePortfolioUpdate}
              onNavigate={setActiveSection}
              onFilterHoldings={handleFilterHoldings}
              onAlertCreated={handleAlertCreated}
              getHoldingShares={getHoldingShares}
              holdings={holdings}
            />
          </div>
        </AIPanel>
      }
      rightPanelOpen={aiPanelOpen}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
