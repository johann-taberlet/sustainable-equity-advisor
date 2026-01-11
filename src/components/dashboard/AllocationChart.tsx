"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AllocationData {
  sector: string;
  value: number;
}

interface AllocationChartProps {
  data: AllocationData[];
  currency?: string;
  onSectorClick?: (sector: string) => void;
}

const SECTOR_COLORS: Record<string, string> = {
  Technology: "#3b82f6",
  Consumer: "#10b981",
  Energy: "#f59e0b",
  Healthcare: "#ec4899",
  Industrial: "#8b5cf6",
  Financial: "#06b6d4",
  Utilities: "#84cc16",
  Materials: "#f97316",
  "Real Estate": "#6366f1",
  Communications: "#14b8a6",
};

const DEFAULT_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
];

export function AllocationChart({
  data,
  currency = "CHF",
  onSectorClick,
}: AllocationChartProps) {
  const totalValue = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data],
  );

  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        percentage: ((d.value / totalValue) * 100).toFixed(1),
      })),
    [data, totalValue],
  );

  const handleClick = (entry: { sector: string }) => {
    if (onSectorClick) {
      onSectorClick(entry.sector);
    }
  };

  return (
    <Card data-testid="allocation-chart">
      <CardHeader>
        <CardTitle>Sector Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="sector"
                onClick={handleClick}
                style={{ cursor: onSectorClick ? "pointer" : "default" }}
                label={({ sector, percentage }) => `${sector} ${percentage}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.sector}
                    fill={
                      SECTOR_COLORS[entry.sector] ||
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ fontFamily: "var(--font-jetbrains-mono)" }}
                formatter={(value: number, name: string) => [
                  `${currency} ${value.toLocaleString("en-CH")} (${((value / totalValue) * 100).toFixed(1)}%)`,
                  name,
                ]}
              />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value: string) => (
                  <span className="text-sm">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
