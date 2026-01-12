import { useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

interface HoldingCardProps {
  symbol: string;
  name: string;
  shares: number;
  value: number;
  esgScore: number;
  currency?: string;
  /** If true, values are in USD and will be converted using useCurrency */
  baseUSD?: boolean;
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
  currency: currencyProp = "CHF",
  baseUSD = false,
}: HoldingCardProps) {
  // Use context for reactive currency conversion when baseUSD is true
  const { currency: contextCurrency, convertAmount } = useCurrency();

  // Determine which currency to use and whether to convert
  const displayCurrency = baseUSD ? contextCurrency : currencyProp;
  const displayValue = baseUSD ? convertAmount(value) : value;

  const formattedValue = new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: displayCurrency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayValue);

  return (
    <div
      data-testid="holding-card"
      className="mt-3 rounded-lg border bg-card p-3 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex flex-col items-center justify-center rounded-md px-2 py-1 shrink-0",
              getEsgBg(esgScore),
            )}
          >
            <span
              className={cn(
                "text-lg font-bold leading-none",
                getEsgColor(esgScore),
              )}
            >
              {esgScore}
            </span>
            <span className="text-[10px] text-muted-foreground">ESG</span>
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold">{symbol}</span>
              <span className="text-muted-foreground text-sm truncate">
                {name}
              </span>
            </div>
            <div className="flex items-baseline gap-3 text-sm">
              <span>
                <span className="font-semibold text-base">{shares}</span>
                <span className="text-muted-foreground ml-1">shares</span>
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="font-medium">{formattedValue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
