"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ESGComparisonChartProps } from "@/lib/a2ui/types";

function getBarColor(score: number): string {
  if (score >= 80) return "hsl(142, 76%, 36%)"; // green-600
  if (score >= 60) return "hsl(45, 93%, 47%)"; // yellow-500
  if (score >= 40) return "hsl(24, 95%, 53%)"; // orange-500
  return "hsl(0, 84%, 60%)"; // red-500
}

export function ESGComparisonChart({ companies }: ESGComparisonChartProps) {
  const data = companies.map((company) => ({
    name: company.symbol,
    fullName: company.name,
    ESG: company.esgScore,
    E: company.environmental,
    S: company.social,
    G: company.governance,
  }));

  // Sort by ESG score descending
  data.sort((a, b) => b.ESG - a.ESG);

  const showBreakdown = companies.some(
    (c) =>
      c.environmental !== undefined &&
      c.social !== undefined &&
      c.governance !== undefined,
  );

  return (
    <Card data-a2ui="ESGComparisonChart">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          ESG Score Comparison
        </CardTitle>
        <div className="text-xs text-muted-foreground">
          {companies.length} companies compared
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis
                type="category"
                dataKey="name"
                width={45}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  value,
                  name === "ESG" ? "Overall ESG" : name,
                ]}
                labelFormatter={(label) => {
                  const item = data.find((d) => d.name === label);
                  return item?.fullName || label;
                }}
              />
              {showBreakdown && <Legend />}
              <Bar dataKey="ESG" name="Overall ESG" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.ESG)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((company, index) => (
            <div
              key={company.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-muted-foreground">
                  {index + 1}.
                </span>
                <span className="font-medium">{company.name}</span>
                <span className="text-muted-foreground text-xs">
                  {company.fullName}
                </span>
              </div>
              <div
                className="font-bold"
                style={{ color: getBarColor(company.ESG) }}
              >
                {company.ESG}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
