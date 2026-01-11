"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ESGRadarChartProps } from "@/lib/a2ui/types";

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function ESGRadarChart({
  symbol,
  companyName,
  environmental,
  social,
  governance,
}: ESGRadarChartProps) {
  const overallScore = Math.round((environmental + social + governance) / 3);

  const data = [
    { category: "Environmental", score: environmental, fullMark: 100 },
    { category: "Social", score: social, fullMark: 100 },
    { category: "Governance", score: governance, fullMark: 100 },
  ];

  // Calculate fill color based on overall score
  const fillColor =
    overallScore >= 80
      ? "hsl(142, 76%, 36%)" // green-600
      : overallScore >= 60
        ? "hsl(45, 93%, 47%)" // yellow-500
        : overallScore >= 40
          ? "hsl(24, 95%, 53%)" // orange-500
          : "hsl(0, 84%, 60%)"; // red-500

  return (
    <Card data-a2ui="ESGRadarChart">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          ESG Profile: {companyName}
        </CardTitle>
        <div className="text-xs text-muted-foreground">{symbol}</div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Overall Score</span>
          <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
            {overallScore}
          </span>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="category"
                tick={{ fill: "currentColor", fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 9 }}
                tickCount={5}
              />
              <Radar
                name={symbol}
                dataKey="score"
                stroke={fillColor}
                fill={fillColor}
                fillOpacity={0.4}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
          <div>
            <div className="text-muted-foreground">E</div>
            <div className={`font-semibold ${getScoreColor(environmental)}`}>
              {environmental}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">S</div>
            <div className={`font-semibold ${getScoreColor(social)}`}>
              {social}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">G</div>
            <div className={`font-semibold ${getScoreColor(governance)}`}>
              {governance}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
