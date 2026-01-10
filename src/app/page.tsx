"use client";

import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { MessageSquare, PieChart, Search, TrendingUp } from "lucide-react";
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
}

const initialHoldings: Holding[] = [
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 100, value: 42000, esgScore: 85 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 50, value: 62500, esgScore: 68 },
];

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

  const handlePortfolioUpdate = useCallback(() => {
    // Add AAPL to portfolio when updated via chat
    setHoldings((prev) => {
      if (prev.some((h) => h.symbol === "AAPL")) {
        return prev;
      }
      return [
        ...prev,
        { symbol: "AAPL", name: "Apple Inc.", shares: 10, value: 1900, esgScore: 72 },
      ];
    });
  }, []);

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

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
            <PieChart className="h-4 w-4" />
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
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid="portfolio-value">
                  CHF {totalValue.toLocaleString("en-CH")}
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
                    <span className="text-2xl font-bold" data-testid="esg-score" data-esg-score={avgESGScore}>
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
                      <TableHead className="text-right" data-testid="portfolio-esg">ESG</TableHead>
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
                          <span
                            data-testid="esg-score"
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
