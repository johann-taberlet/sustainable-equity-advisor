"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageSquare, PieChart as PieChartIcon, Search, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Chat } from "@/components/chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

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

export default function Home() {
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);
  const [esgDataLoaded, setEsgDataLoaded] = useState(false);

  // Fetch ESG data from API on mount and when holdings change
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
            })
          );
          setEsgDataLoaded(true);
        }
      } catch (error) {
        console.error("Error fetching ESG data:", error);
        setEsgDataLoaded(true); // Mark as loaded even on error to show current data
      }
    };

    fetchESGData();
  }, []);

  const handlePortfolioUpdate = useCallback((data?: { symbol?: string; action?: string }) => {
    // Handle portfolio updates via chat
    if (data?.symbol === "GOOGL" || data?.action === "add-googl") {
      setHoldings((prev) => {
        if (prev.some((h) => h.symbol === "GOOGL")) {
          return prev;
        }
        return [
          ...prev,
          { symbol: "GOOGL", name: "Alphabet Inc.", shares: 5, value: 8750, esgScore: 74, weight: 5, sector: "Technology" },
        ];
      });
    } else if (data?.action === "remove-aapl") {
      setHoldings((prev) => prev.filter((h) => h.symbol !== "AAPL"));
    } else {
      // Default: Add AAPL if not present
      setHoldings((prev) => {
        if (prev.some((h) => h.symbol === "AAPL")) {
          return prev;
        }
        return [
          ...prev,
          { symbol: "AAPL", name: "Apple Inc.", shares: 10, value: 1900, esgScore: 72, sector: "Technology" },
        ];
      });
    }
  }, []);

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  // Calculate daily change (mock for demo)
  const dailyChange = 1.85; // percentage
  const dailyChangeValue = totalValue * (dailyChange / 100);

  // Calculate aggregate ESG scores
  const avgESGScore = holdings.length > 0
    ? Math.round(holdings.reduce((sum, h) => sum + h.esgScore, 0) / holdings.length)
    : 0;
  const avgEnvironmental = holdings.length > 0 && holdings.some(h => h.environmentalScore)
    ? Math.round(holdings.reduce((sum, h) => sum + (h.environmentalScore || 0), 0) / holdings.filter(h => h.environmentalScore).length)
    : 0;
  const avgSocial = holdings.length > 0 && holdings.some(h => h.socialScore)
    ? Math.round(holdings.reduce((sum, h) => sum + (h.socialScore || 0), 0) / holdings.filter(h => h.socialScore).length)
    : 0;
  const avgGovernance = holdings.length > 0 && holdings.some(h => h.governanceScore)
    ? Math.round(holdings.reduce((sum, h) => sum + (h.governanceScore || 0), 0) / holdings.filter(h => h.governanceScore).length)
    : 0;

  // Calculate sector allocation for pie chart
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

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-lg font-semibold">Montblanc Capital</h1>
        <ThemeToggle />
      </header>

      <Tabs defaultValue="chat" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className="mx-4 mt-4 max-w-full flex-wrap">
          <TabsTrigger value="chat" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Chat Advisor</span>
            <span className="sm:hidden">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="gap-1.5">
            <PieChartIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Portfolio Dashboard</span>
            <span className="sm:hidden">Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="screening" className="gap-1.5">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">ESG Screening</span>
            <span className="sm:hidden">Screening</span>
          </TabsTrigger>
          <TabsTrigger value="market" className="gap-1.5">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Market Insights</span>
            <span className="sm:hidden">Market</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 overflow-hidden">
          <div data-testid="chat-content" className="h-full">
            <Chat onPortfolioUpdate={handlePortfolioUpdate} />
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="flex-1 overflow-auto p-4">
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

            {/* Benchmark Comparison Card */}
            <Card>
              <CardHeader>
                <CardTitle>Benchmark Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div data-testid="benchmark" className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">vs MSCI ESG Leaders Index</span>
                    <span className={`font-semibold ${(dailyChange - benchmarkDailyChange) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {(dailyChange - benchmarkDailyChange) >= 0 ? "+" : ""}{(dailyChange - benchmarkDailyChange).toFixed(2)}% outperformance
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ESG Score vs Benchmark</span>
                    <span className={`font-semibold ${(avgESGScore - benchmarkESGScore) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {(avgESGScore - benchmarkESGScore) >= 0 ? "+" : ""}{avgESGScore - benchmarkESGScore} points
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allocation Chart Card */}
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

            {/* ESG Breakdown Card */}
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
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
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

            <Card>
              <CardHeader>
                <CardTitle>Holdings</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="screening" className="flex-1 p-4">
          <div data-testid="screening-content" className="h-full">
            <p className="text-muted-foreground">Screen ESG investments</p>
          </div>
        </TabsContent>

        <TabsContent value="market" className="flex-1 p-4">
          <div data-testid="market-content" className="h-full">
            <p className="text-muted-foreground">Market insights and trends</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
