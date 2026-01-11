"use client";

import { TrendingDown, TrendingUp, Leaf, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PortfolioOverviewProps {
  totalValue: number;
  currency?: string;
  dailyChange: number;
  dailyChangePercent: number;
  esgScore: number;
  environmentalScore?: number;
  socialScore?: number;
  governanceScore?: number;
  sectorAllocation?: { sector: string; percentage: number }[];
  isLoading?: boolean;
}

function getESGColorClass(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function PortfolioOverview({
  totalValue,
  currency = "CHF",
  dailyChange,
  dailyChangePercent,
  esgScore,
  environmentalScore,
  socialScore,
  governanceScore,
  sectorAllocation,
  isLoading = false,
}: PortfolioOverviewProps) {
  const isPositive = dailyChange >= 0;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="mt-2 h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      data-testid="portfolio-overview"
    >
      {/* Total Value Card */}
      <Card data-testid="portfolio-value-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className="font-data text-2xl font-bold"
            data-testid="portfolio-value"
          >
            {currency} {totalValue.toLocaleString("en-CH")}
          </div>
          <p className="text-xs text-muted-foreground">Portfolio net worth</p>
        </CardContent>
      </Card>

      {/* Daily Change Card */}
      <Card data-testid="daily-change-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Daily Change</CardTitle>
          {isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-600" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-600" />
          )}
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "font-data text-2xl font-bold",
              isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400",
            )}
            data-testid="portfolio-change"
          >
            {isPositive ? "+" : ""}
            {dailyChangePercent.toFixed(2)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {isPositive ? "+" : ""}
            {currency} {dailyChange.toLocaleString("en-CH")}
          </p>
        </CardContent>
      </Card>

      {/* ESG Score Card */}
      <Card data-testid="esg-score-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ESG Score</CardTitle>
          <Leaf className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "font-data text-2xl font-bold",
              getESGColorClass(esgScore),
            )}
            data-testid="portfolio-esg"
          >
            {esgScore}/100
          </div>
          <div className="mt-2 space-y-1">
            {environmentalScore !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Environmental</span>
                <span
                  className={cn(
                    "font-data",
                    getESGColorClass(environmentalScore),
                  )}
                >
                  {environmentalScore}
                </span>
              </div>
            )}
            {socialScore !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Social</span>
                <span
                  className={cn("font-data", getESGColorClass(socialScore))}
                >
                  {socialScore}
                </span>
              </div>
            )}
            {governanceScore !== undefined && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Governance</span>
                <span
                  className={cn("font-data", getESGColorClass(governanceScore))}
                >
                  {governanceScore}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Allocation Card */}
      <Card data-testid="allocation-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Sectors</CardTitle>
        </CardHeader>
        <CardContent>
          {sectorAllocation && sectorAllocation.length > 0 ? (
            <div className="space-y-2">
              {sectorAllocation.slice(0, 3).map((sector) => (
                <div key={sector.sector}>
                  <div className="flex items-center justify-between text-xs">
                    <span>{sector.sector}</span>
                    <span className="font-data font-medium">
                      {sector.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={sector.percentage} className="h-1" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No allocation data</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
