"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface PerformanceDataPoint {
  date: string;
  value: number;
  benchmark?: number;
}

interface PerformanceChartProps {
  data: PerformanceDataPoint[];
  showBenchmark?: boolean;
  benchmarkLabel?: string;
}

type TimeRange = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";

const TIME_RANGES: TimeRange[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];

function getTimeRangeDays(range: TimeRange): number {
  switch (range) {
    case "1D":
      return 1;
    case "1W":
      return 7;
    case "1M":
      return 30;
    case "3M":
      return 90;
    case "1Y":
      return 365;
    case "ALL":
      return Infinity;
  }
}

function formatDate(dateStr: string, range: TimeRange): string {
  const date = new Date(dateStr);
  if (range === "1D") {
    return date.toLocaleTimeString("en-CH", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (range === "1W" || range === "1M") {
    return date.toLocaleDateString("en-CH", { day: "2-digit", month: "short" });
  }
  return date.toLocaleDateString("en-CH", {
    month: "short",
    year: "2-digit",
  });
}

export function PerformanceChart({
  data,
  showBenchmark = false,
  benchmarkLabel = "Benchmark",
}: PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1M");

  // Get currency from context
  const { currency, convertAmount } = useCurrency();

  // Get currency symbol
  const currencySymbol =
    currency === "USD" ? "$" : currency === "EUR" ? "€" : "CHF";

  const filteredData = useMemo(() => {
    if (data.length === 0) return [];

    const days = getTimeRangeDays(timeRange);
    if (days === Infinity) return data;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return data.filter((d) => new Date(d.date) >= cutoffDate);
  }, [data, timeRange]);

  const formattedData = useMemo(
    () =>
      filteredData.map((d) => ({
        ...d,
        formattedDate: formatDate(d.date, timeRange),
      })),
    [filteredData, timeRange],
  );

  const { change, changePercent, isPositive } = useMemo(() => {
    if (filteredData.length < 2) {
      return { change: 0, changePercent: 0, isPositive: true };
    }
    const first = filteredData[0].value;
    const last = filteredData[filteredData.length - 1].value;
    const ch = last - first;
    return {
      change: ch,
      changePercent: (ch / first) * 100,
      isPositive: ch >= 0,
    };
  }, [filteredData]);

  const domain = useMemo(() => {
    if (filteredData.length === 0) return [0, 100];
    const values = filteredData.flatMap((d) =>
      showBenchmark && d.benchmark !== undefined
        ? [d.value, d.benchmark]
        : [d.value],
    );
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [filteredData, showBenchmark]);

  return (
    <Card data-testid="performance-chart">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Performance</CardTitle>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={cn(
                "font-data text-lg font-semibold",
                isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {isPositive ? "+" : ""}
              {changePercent.toFixed(2)}%
            </span>
            <span className="font-data text-sm text-muted-foreground">
              ({isPositive ? "+" : ""}
              {currencySymbol}{" "}
              {convertAmount(change).toLocaleString("en-CH", {
                maximumFractionDigits: 0,
              })}
              )
            </span>
          </div>
        </div>
        <div className="flex gap-1">
          {TIME_RANGES.map((range) => (
            <Button
              key={range}
              size="sm"
              variant={timeRange === range ? "default" : "ghost"}
              className="h-7 px-2 text-xs"
              onClick={() => setTimeRange(range)}
              data-testid={`range-${range}`}
            >
              {range}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="formattedDate"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={domain}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                tickFormatter={(value) =>
                  `${currencySymbol} ${convertAmount(value).toLocaleString("en-CH", { maximumFractionDigits: 0 })}`
                }
                width={90}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const point = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <p className="text-xs text-muted-foreground">
                        {point.date}
                      </p>
                      <p className="font-data text-sm font-medium">
                        {currencySymbol}{" "}
                        {convertAmount(point.value).toLocaleString("en-CH", {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                      {showBenchmark && point.benchmark !== undefined && (
                        <p className="text-xs text-muted-foreground">
                          {benchmarkLabel}: {currencySymbol}{" "}
                          {convertAmount(point.benchmark).toLocaleString(
                            "en-CH",
                            { maximumFractionDigits: 0 },
                          )}
                        </p>
                      )}
                    </div>
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={isPositive ? "#22c55e" : "#ef4444"}
                strokeWidth={2}
                dot={false}
                animationDuration={500}
              />
              {showBenchmark && (
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke="#6b7280"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  dot={false}
                  animationDuration={500}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        {showBenchmark && (
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div
                className={cn(
                  "h-0.5 w-4",
                  isPositive ? "bg-green-500" : "bg-red-500",
                )}
              />
              <span>Portfolio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-0.5 w-4 border-t-2 border-dashed border-gray-500" />
              <span>{benchmarkLabel}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
