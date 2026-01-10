"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ESGScoreGaugeProps } from "@/lib/a2ui/types";

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

function getProgressColor(score: number): string {
  if (score >= 80) return "[&>div]:bg-green-600";
  if (score >= 60) return "[&>div]:bg-yellow-600";
  if (score >= 40) return "[&>div]:bg-orange-600";
  return "[&>div]:bg-red-600";
}

export function ESGScoreGauge({
  score,
  environmental,
  social,
  governance,
}: ESGScoreGaugeProps) {
  return (
    <Card data-a2ui="ESGScoreGauge">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          ESG Score
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}
          </div>
          <div className="text-sm text-muted-foreground">/ 100</div>
        </div>
        <Progress
          value={score}
          className={`mt-2 h-2 ${getProgressColor(score)}`}
        />
        {(environmental !== undefined ||
          social !== undefined ||
          governance !== undefined) && (
          <div className="mt-4 space-y-2" data-testid="esg-breakdown">
            {environmental !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span>Environmental</span>
                <span className={getScoreColor(environmental)}>{environmental}</span>
              </div>
            )}
            {social !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span>Social</span>
                <span className={getScoreColor(social)}>{social}</span>
              </div>
            )}
            {governance !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span>Governance</span>
                <span className={getScoreColor(governance)}>{governance}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
