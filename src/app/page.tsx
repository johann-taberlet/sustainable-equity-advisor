"use client";

import { useState, useCallback } from "react";
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

interface Holding {
  symbol: string;
  name: string;
  shares: number;
  value: number;
  esgScore: number;
}

const initialHoldings: Holding[] = [
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 100, value: 42000, esgScore: 85 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 50, value: 62500, esgScore: 68 },
];

export default function Home() {
  const [holdings, setHoldings] = useState<Holding[]>(initialHoldings);

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
                        <TableCell className="text-right">{holding.esgScore}</TableCell>
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
