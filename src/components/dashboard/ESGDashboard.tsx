"use client";

import { Leaf, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ESGHolding {
  symbol: string;
  name: string;
  esgScore: number;
  environmentalScore?: number;
  socialScore?: number;
  governanceScore?: number;
  sector: string;
}

interface ESGDashboardProps {
  holdings: ESGHolding[];
  portfolioScore: number;
  environmentalScore?: number;
  socialScore?: number;
  governanceScore?: number;
}

function getESGColorClass(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getESGBgColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

export function ESGDashboard({
  holdings,
  portfolioScore,
  environmentalScore,
  socialScore,
  governanceScore,
}: ESGDashboardProps) {
  // Calculate sector ESG averages
  const sectorData = useMemo(() => {
    const sectorMap: Record<string, { total: number; count: number }> = {};

    for (const h of holdings) {
      if (!sectorMap[h.sector]) {
        sectorMap[h.sector] = { total: 0, count: 0 };
      }
      sectorMap[h.sector].total += h.esgScore;
      sectorMap[h.sector].count += 1;
    }

    return Object.entries(sectorMap)
      .map(([sector, data]) => ({
        sector,
        score: Math.round(data.total / data.count),
      }))
      .sort((a, b) => b.score - a.score);
  }, [holdings]);

  // Leaders and laggards
  const sortedByESG = useMemo(
    () => [...holdings].sort((a, b) => b.esgScore - a.esgScore),
    [holdings],
  );

  const leaders = sortedByESG.slice(0, 3);
  const laggards = sortedByESG.slice(-3).reverse();

  return (
    <div className="grid gap-4 md:grid-cols-2" data-testid="esg-dashboard">
      {/* Main ESG Score Card */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Portfolio ESG Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Main score */}
            <div className="text-center sm:text-left">
              <div
                className={cn(
                  "font-data text-5xl font-bold",
                  getESGColorClass(portfolioScore),
                )}
                data-testid="portfolio-esg"
              >
                {portfolioScore}
              </div>
              <p className="text-sm text-muted-foreground">out of 100</p>
            </div>

            {/* E/S/G Breakdown */}
            <div className="grid w-full max-w-xs grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground">
                  Environmental
                </div>
                <div
                  className={cn(
                    "font-data text-2xl font-bold",
                    getESGColorClass(environmentalScore || 0),
                  )}
                  data-testid="e-score"
                >
                  {environmentalScore || "—"}
                </div>
                <Progress
                  value={environmentalScore || 0}
                  className="mt-1 h-2"
                />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground">
                  Social
                </div>
                <div
                  className={cn(
                    "font-data text-2xl font-bold",
                    getESGColorClass(socialScore || 0),
                  )}
                  data-testid="s-score"
                >
                  {socialScore || "—"}
                </div>
                <Progress value={socialScore || 0} className="mt-1 h-2" />
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-muted-foreground">
                  Governance
                </div>
                <div
                  className={cn(
                    "font-data text-2xl font-bold",
                    getESGColorClass(governanceScore || 0),
                  )}
                  data-testid="g-score"
                >
                  {governanceScore || "—"}
                </div>
                <Progress value={governanceScore || 0} className="mt-1 h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sector ESG Chart */}
      <Card>
        <CardHeader>
          <CardTitle>ESG by Sector</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} />
                <YAxis
                  type="category"
                  dataKey="sector"
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value}/100`, "ESG Score"]}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {sectorData.map((entry) => (
                    <Cell
                      key={entry.sector}
                      fill={getESGBgColor(entry.score)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Leaders & Laggards */}
      <Card>
        <CardHeader>
          <CardTitle>ESG Leaders & Laggards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Leaders */}
          <div>
            <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="h-4 w-4" />
              Top Performers
            </h4>
            <div className="space-y-2">
              {leaders.map((h) => (
                <div
                  key={h.symbol}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">{h.symbol}</span>
                    <span className="ml-2 text-muted-foreground">{h.name}</span>
                  </div>
                  <span
                    className={cn(
                      "font-data font-medium",
                      getESGColorClass(h.esgScore),
                    )}
                  >
                    {h.esgScore}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Laggards */}
          <div>
            <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-orange-600">
              <TrendingDown className="h-4 w-4" />
              Improvement Areas
            </h4>
            <div className="space-y-2">
              {laggards.map((h) => (
                <div
                  key={h.symbol}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">{h.symbol}</span>
                    <span className="ml-2 text-muted-foreground">{h.name}</span>
                  </div>
                  <span
                    className={cn(
                      "font-data font-medium",
                      getESGColorClass(h.esgScore),
                    )}
                  >
                    {h.esgScore}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
