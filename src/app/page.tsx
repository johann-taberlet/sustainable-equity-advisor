"use client";

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
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { type NavigationSection, Sidebar } from "@/components/layout/Sidebar";
import { AIPanel } from "@/components/ai/AIPanel";
import { Chat, type PortfolioAction } from "@/components/chat";
import { HoldingsTablePro } from "@/components/dashboard/HoldingsTablePro";
import { ESGDashboard } from "@/components/dashboard/ESGDashboard";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { ESGScreening } from "@/components/dashboard/ESGScreening";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  fetchExchangeRates,
  formatCurrency,
  type Currency,
} from "@/lib/currency";

interface ESGData {
  symbol: string;
  companyName: string;
  esgScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
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
  weight?: number;
  change?: number;
  sector: string;
}

// Benchmark data (MSCI ESG Leaders Index mock)
const benchmarkESGScore = 72;
const benchmarkDailyChange = 1.2;

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
  const [holdings, setHoldings] = useState<Holding[]>([]); // Values stored in USD
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [currency, setCurrency] = useState<Currency>("CHF");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    USD: 1,
    CHF: 0.88,
    EUR: 0.92,
  });

  // Fetch exchange rates on mount
  useEffect(() => {
    fetchExchangeRates().then((rates) => {
      setExchangeRates(rates.rates);
    });
  }, []);

  // Helper to convert USD to display currency
  const toDisplayCurrency = useCallback(
    (amountUSD: number) => amountUSD * (exchangeRates[currency] || 1),
    [exchangeRates, currency],
  );

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
  }, [holdings.length]);

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

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const dailyChange = 1.85;
  const dailyChangeValue = totalValue * (dailyChange / 100);

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
          <div data-testid="portfolio-content" className="space-y-4">
            <Card data-testid="portfolio-summary">
              <CardHeader>
                <CardTitle>Portfolio Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-baseline gap-4">
                  <div
                    className="text-3xl font-bold"
                    data-testid="portfolio-value"
                  >
                    {formatCurrency(toDisplayCurrency(totalValue), currency)}
                  </div>
                  <div
                    data-testid="portfolio-change"
                    className={`text-lg font-semibold ${dailyChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {dailyChange >= 0 ? "+" : ""}
                    {dailyChange.toFixed(2)}% ({dailyChange >= 0 ? "+" : ""}
                    {formatCurrency(
                      toDisplayCurrency(dailyChangeValue),
                      currency,
                    )}
                    )
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Benchmark Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div data-testid="benchmark" className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      vs MSCI ESG Leaders Index
                    </span>
                    <span
                      className={`font-semibold ${(dailyChange - benchmarkDailyChange) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {dailyChange - benchmarkDailyChange >= 0 ? "+" : ""}
                      {(dailyChange - benchmarkDailyChange).toFixed(2)}%
                      outperformance
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      ESG Score vs Benchmark
                    </span>
                    <span
                      className={`font-semibold ${(avgESGScore - benchmarkESGScore) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                    >
                      {avgESGScore - benchmarkESGScore >= 0 ? "+" : ""}
                      {avgESGScore - benchmarkESGScore} points
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <PerformanceChart
              data={performanceData}
              currency={currency}
              showBenchmark
              benchmarkLabel="MSCI ESG Leaders"
              exchangeRate={exchangeRates[currency] || 1}
            />

            <Card data-testid="allocation-chart">
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sectorAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) =>
                          `${name} ${percentage}%`
                        }
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
                          formatCurrency(toDisplayCurrency(value), currency),
                          "Value",
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio ESG Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="esg-breakdown">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-2xl font-bold"
                      data-testid="portfolio-esg"
                      data-esg-score={avgESGScore}
                    >
                      <span className={getESGColorClass(avgESGScore)}>
                        {avgESGScore}
                      </span>
                      /100
                    </span>
                    <div data-testid="esg-gauge" className="w-32">
                      <Progress
                        value={avgESGScore}
                        className={getESGBgClass(avgESGScore)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                      <div
                        className="text-sm text-muted-foreground"
                        data-label="Environmental"
                      >
                        Environmental
                      </div>
                      <div
                        className={`text-xl font-semibold ${getESGColorClass(avgEnvironmental)}`}
                        data-testid="e-score"
                      >
                        {avgEnvironmental || "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-sm text-muted-foreground"
                        data-label="Social"
                      >
                        Social
                      </div>
                      <div
                        className={`text-xl font-semibold ${getESGColorClass(avgSocial)}`}
                        data-testid="s-score"
                      >
                        {avgSocial || "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className="text-sm text-muted-foreground"
                        data-label="Governance"
                      >
                        Governance
                      </div>
                      <div
                        className={`text-xl font-semibold ${getESGColorClass(avgGovernance)}`}
                        data-testid="g-score"
                      >
                        {avgGovernance || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  currency={currency}
                  exchangeRate={exchangeRates[currency] || 1}
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

      case "settings":
        return (
          <div data-testid="settings-content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Configure your preferences
                </p>
              </CardContent>
            </Card>
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
          currency={currency}
          onCurrencyChange={setCurrency}
          onAIChatToggle={() => setAiPanelOpen((prev) => !prev)}
          isAIPanelOpen={aiPanelOpen}
        />
      }
      rightPanel={
        <AIPanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)}>
          <div data-testid="chat-content" className="h-full">
            <Chat
              onPortfolioUpdate={handlePortfolioUpdate}
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
