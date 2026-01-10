"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { PortfolioSummaryCardProps } from "@/lib/a2ui/types";

export function PortfolioSummaryCard({
  totalValue,
  currency,
  change,
  changePercent,
  esgScore,
}: PortfolioSummaryCardProps) {
  const isPositive = change >= 0;
  const formattedValue = new Intl.NumberFormat("en-CH", {
    style: "currency",
    currency: currency,
  }).format(totalValue);

  return (
    <Card data-a2ui="PortfolioSummaryCard" data-testid="portfolio-summary">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Portfolio Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
        <div
          className={`flex items-center gap-1 text-sm ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {currency} {change.toLocaleString("en-CH")} ({changePercent.toFixed(2)}%)
          </span>
        </div>
        {esgScore !== undefined && (
          <div className="mt-2 text-sm text-muted-foreground">
            ESG Score: <span className="font-medium">{esgScore}/100</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
