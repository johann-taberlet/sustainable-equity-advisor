import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface HoldingCardProps {
  symbol: string;
  name: string;
  shares: number;
  value: number;
  esgScore: number;
  currency?: string;
}

function getEsgColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getEsgBg(score: number): string {
  if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
  if (score >= 60) return "bg-yellow-100 dark:bg-yellow-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

export function HoldingCard({
  symbol,
  name,
  shares,
  value,
  esgScore,
  currency = "CHF",
}: HoldingCardProps) {
  const formattedValue = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

  return (
    <div
      data-testid="holding-card"
      className="mt-3 rounded-lg border bg-card p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">{symbol}</span>
            <span className="text-muted-foreground text-sm truncate">{name}</span>
          </div>
          <div className="mt-2 flex items-baseline gap-4">
            <div>
              <span className="text-2xl font-bold">{shares}</span>
              <span className="text-muted-foreground text-sm ml-1">shares</span>
            </div>
            <div className="text-muted-foreground">
              <TrendingUp className="inline h-4 w-4 mr-1" />
              <span className="font-medium text-foreground">{formattedValue}</span>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-lg px-3 py-2",
            getEsgBg(esgScore)
          )}
        >
          <span className={cn("text-xl font-bold", getEsgColor(esgScore))}>
            {esgScore}
          </span>
          <span className="text-xs text-muted-foreground">ESG</span>
        </div>
      </div>
    </div>
  );
}
