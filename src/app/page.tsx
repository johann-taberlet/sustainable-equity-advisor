"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Header } from "@/components/layout/Header";
import { type NavigationSection, Sidebar } from "@/components/layout/Sidebar";
import { FloatingAIButton } from "@/components/ai/FloatingAIButton";
import { AIPanel } from "@/components/ai/AIPanel";
import { Chat, type PortfolioAction } from "@/components/chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

// Demo portfolio with 11 stocks as per PRD
const initialHoldings: Holding[] = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 150, value: 28500, esgScore: 72, weight: 15, sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 100, value: 42000, esgScore: 85, weight: 12, sector: "Technology" },
  { symbol: "NESN.SW", name: "Nestlé S.A.", shares: 80, value: 8800, esgScore: 78, weight: 10, sector: "Consumer" },
  { symbol: "ASML", name: "ASML Holding N.V.", shares: 12, value: 9600, esgScore: 81, weight: 10, sector: "Technology" },
  { symbol: "VWS.CO", name: "Vestas Wind Systems", shares: 200, value: 5600, esgScore: 88, weight: 8, sector: "Energy" },
  { symbol: "NOVN.SW", name: "Novartis AG", shares: 60, value: 5400, esgScore: 76, weight: 8, sector: "Healthcare" },
  { symbol: "SU.PA", name: "Schneider Electric", shares: 35, value: 7350, esgScore: 84, weight: 8, sector: "Industrial" },
  { symbol: "TSM", name: "Taiwan Semiconductor", shares: 40, value: 6800, esgScore: 71, weight: 8, sector: "Technology" },
  { symbol: "ULVR.L", name: "Unilever PLC", shares: 120, value: 5520, esgScore: 82, weight: 7, sector: "Consumer" },
  { symbol: "ORSTED.CO", name: "Ørsted A/S", shares: 50, value: 4500, esgScore: 91, weight: 7, sector: "Energy" },
  { symbol: "FSLR", name: "First Solar Inc.", shares: 30, value: 5250, esgScore: 79, weight: 7, sector: "Energy" },
];

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
  const [activeSection, setActiveSection] = useState<NavigationSection>("dashboard");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(portfolios[0].id);
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  // Fetch ESG data from API on mount
  useEffect(() => {
    const fetchESGData = async () => {
      const symbols = holdings.map((h) => h.symbol).join(",");
      try {
        const response = await fetch(`/api/esg?symbols=${encodeURIComponent(symbols)}`);
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
  }, []);

  const handlePortfolioUpdate = useCallback((action: PortfolioAction) => {
    const { type, symbol, shares = 1, name } = action;

    if (type === "add_holding") {
      setHoldings((prev) => {
        const existingIndex = prev.findIndex((h) => h.symbol === symbol);
        if (existingIndex >= 0) {
          // Increment shares for existing holding
          const updated = [...prev];
          const existing = updated[existingIndex];
          const pricePerShare = existing.value / existing.shares;
          updated[existingIndex] = {
            ...existing,
            shares: existing.shares + shares,
            value: (existing.shares + shares) * pricePerShare,
          };
          return updated;
        }
        // Add new holding with estimated price
        const estimatedPricePerShare = symbol === "GOOGL" ? 175 : 100;
        return [
          ...prev,
          {
            symbol,
            name: name || symbol,
            shares,
            value: shares * estimatedPricePerShare,
            esgScore: 75,
            sector: "Technology",
          },
        ];
      });
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
  }, []);

  const getHoldingShares = useCallback((symbol: string): number => {
    const holding = holdings.find((h) => h.symbol === symbol);
    return holding?.shares || 0;
  }, [holdings]);

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const dailyChange = 1.85;
  const dailyChangeValue = totalValue * (dailyChange / 100);

  const avgESGScore = holdings.length > 0
    ? Math.round(holdings.reduce((sum, h) => sum + h.esgScore, 0) / holdings.length)
    : 0;
  const avgEnvironmental = holdings.length > 0 && holdings.some((h) => h.environmentalScore)
    ? Math.round(holdings.reduce((sum, h) => sum + (h.environmentalScore || 0), 0) / holdings.filter((h) => h.environmentalScore).length)
    : 0;
  const avgSocial = holdings.length > 0 && holdings.some((h) => h.socialScore)
    ? Math.round(holdings.reduce((sum, h) => sum + (h.socialScore || 0), 0) / holdings.filter((h) => h.socialScore).length)
    : 0;
  const avgGovernance = holdings.length > 0 && holdings.some((h) => h.governanceScore)
    ? Math.round(holdings.reduce((sum, h) => sum + (h.governanceScore || 0), 0) / holdings.filter((h) => h.governanceScore).length)
    : 0;

  const sectorAllocation = useMemo(() => {
    const sectorTotals: Record<string, number> = {};
    for (const holding of holdings) {
      sectorTotals[holding.sector] = (sectorTotals[holding.sector] || 0) + holding.value;
    }
    return Object.entries(sectorTotals).map(([name, value]) => ({
      name,
      value,
      percentage: ((value / totalValue) * 100).toFixed(1),
    }));
  }, [holdings, totalValue]);

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
                  <div className="text-3xl font-bold" data-testid="portfolio-value">
                    CHF {totalValue.toLocaleString("en-CH")}
                  </div>
                  <div
                    data-testid="portfolio-change"
                    className={`text-lg font-semibold ${dailyChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {dailyChange >= 0 ? "+" : ""}{dailyChange.toFixed(2)}% ({dailyChange >= 0 ? "+" : ""}CHF {dailyChangeValue.toLocaleString("en-CH", { maximumFractionDigits: 0 })})
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
                    <span className="text-muted-foreground">vs MSCI ESG Leaders Index</span>
                    <span className={`font-semibold ${(dailyChange - benchmarkDailyChange) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {(dailyChange - benchmarkDailyChange) >= 0 ? "+" : ""}{(dailyChange - benchmarkDailyChange).toFixed(2)}% outperformance
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ESG Score vs Benchmark</span>
                    <span className={`font-semibold ${(avgESGScore - benchmarkESGScore) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {(avgESGScore - benchmarkESGScore) >= 0 ? "+" : ""}{avgESGScore - benchmarkESGScore} points
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                      >
                        {sectorAllocation.map((entry) => (
                          <Cell key={entry.name} fill={SECTOR_COLORS[entry.name] || "#6b7280"} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`CHF ${value.toLocaleString("en-CH")}`, "Value"]}
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
                    <span className="text-2xl font-bold" data-testid="portfolio-esg" data-esg-score={avgESGScore}>
                      <span className={getESGColorClass(avgESGScore)}>{avgESGScore}</span>/100
                    </span>
                    <div data-testid="esg-gauge" className="w-32">
                      <Progress value={avgESGScore} className={getESGBgClass(avgESGScore)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground" data-label="Environmental">Environmental</div>
                      <div className={`text-xl font-semibold ${getESGColorClass(avgEnvironmental)}`} data-testid="e-score">
                        {avgEnvironmental || "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground" data-label="Social">Social</div>
                      <div className={`text-xl font-semibold ${getESGColorClass(avgSocial)}`} data-testid="s-score">
                        {avgSocial || "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground" data-label="Governance">Governance</div>
                      <div className={`text-xl font-semibold ${getESGColorClass(avgGovernance)}`} data-testid="g-score">
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
                <div className="overflow-x-auto">
                <Table data-testid="holdings-list">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Shares</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="text-right">Weight %</TableHead>
                      <TableHead className="text-right">ESG</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((holding) => (
                      <TableRow key={holding.symbol} data-testid="holding-row">
                        <TableCell className="font-medium">{holding.symbol}</TableCell>
                        <TableCell>{holding.name}</TableCell>
                        <TableCell className="text-right">{holding.shares}</TableCell>
                        <TableCell className="text-right">
                          CHF {holding.value.toLocaleString("en-CH")}
                        </TableCell>
                        <TableCell className="text-right">
                          {((holding.value / totalValue) * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            data-testid="holding-esg-score"
                            data-esg-score={holding.esgScore}
                            className={`font-medium ${getESGColorClass(holding.esgScore)}`}
                          >
                            {holding.esgScore}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "esg":
        return (
          <div data-testid="esg-content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ESG Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="esg-breakdown">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold" data-testid="portfolio-esg" data-esg-score={avgESGScore}>
                      <span className={getESGColorClass(avgESGScore)}>{avgESGScore}</span>/100
                    </span>
                    <div data-testid="esg-gauge" className="w-32">
                      <Progress value={avgESGScore} className={getESGBgClass(avgESGScore)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 border-t pt-4">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Environmental</div>
                      <div className={`text-xl font-semibold ${getESGColorClass(avgEnvironmental)}`} data-testid="e-score">
                        {avgEnvironmental || "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Social</div>
                      <div className={`text-xl font-semibold ${getESGColorClass(avgSocial)}`} data-testid="s-score">
                        {avgSocial || "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Governance</div>
                      <div className={`text-xl font-semibold ${getESGColorClass(avgGovernance)}`} data-testid="g-score">
                        {avgGovernance || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Holdings ESG Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">ESG Score</TableHead>
                      <TableHead className="text-right">E</TableHead>
                      <TableHead className="text-right">S</TableHead>
                      <TableHead className="text-right">G</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holdings.map((holding) => (
                      <TableRow key={holding.symbol}>
                        <TableCell className="font-medium">{holding.symbol}</TableCell>
                        <TableCell>{holding.name}</TableCell>
                        <TableCell className="text-right">
                          <span className={getESGColorClass(holding.esgScore)} data-testid="esg-score">
                            {holding.esgScore}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {holding.environmentalScore || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {holding.socialScore || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {holding.governanceScore || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "screening":
        return (
          <div data-testid="screening-content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>ESG Screening</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Screen ESG investments</p>
              </CardContent>
            </Card>
          </div>
        );

      case "watchlist":
        return (
          <div data-testid="watchlist-content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Watchlist</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Track stocks on your watchlist</p>
              </CardContent>
            </Card>
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
                <p className="text-muted-foreground">Configure your preferences</p>
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
        <Sidebar
          activeSection={activeSection}
          onNavigate={setActiveSection}
        />
      }
      header={
        <Header
          portfolios={portfolios}
          selectedPortfolioId={selectedPortfolioId}
          onPortfolioChange={setSelectedPortfolioId}
        />
      }
      rightPanel={
        <AIPanel isOpen={aiPanelOpen} onClose={() => setAiPanelOpen(false)}>
          <div data-testid="chat-content" className="h-full">
            <Chat onPortfolioUpdate={handlePortfolioUpdate} getHoldingShares={getHoldingShares} holdings={holdings} />
          </div>
        </AIPanel>
      }
      rightPanelOpen={aiPanelOpen}
    >
      {renderContent()}

      {/* Floating AI Button */}
      <FloatingAIButton
        onClick={() => setAiPanelOpen(true)}
        isOpen={aiPanelOpen}
      />
    </DashboardLayout>
  );
}
