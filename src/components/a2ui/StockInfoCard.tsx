import { TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/lib/currency";

interface StockInfoCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
  exchange?: string;
  marketCap?: number;
  esgScore?: number | null;
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

function formatMarketCap(value: number, currency: string): string {
  const symbol = currency === "EUR" ? "€" : currency === "CHF" ? "CHF " : "$";
  if (value >= 1e12) return `${symbol}${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `${symbol}${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${symbol}${(value / 1e6).toFixed(1)}M`;
  return `${symbol}${value.toLocaleString()}`;
}

export function StockInfoCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  currency: currencyProp = "USD",
  exchange,
  marketCap,
  esgScore,
  baseUSD = false,
}: StockInfoCardProps) {
  // Use context for reactive currency conversion when baseUSD is true
  const { currency: contextCurrency, convertAmount } = useCurrency();

  // Determine which currency to use and whether to convert
  const displayCurrency = baseUSD ? contextCurrency : currencyProp;
  const displayPrice = baseUSD ? convertAmount(price) : price;
  const displayChange = baseUSD ? convertAmount(change) : change;
  const displayMarketCap = baseUSD && marketCap ? convertAmount(marketCap) : marketCap;

  const isPositive = change >= 0;
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: displayCurrency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayPrice);

  return (
    <div
      data-testid="stock-info-card"
      className="mt-3 rounded-lg border bg-card p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">{symbol}</span>
            {exchange && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {exchange}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{name}</p>
        </div>
        {esgScore && (
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
        )}
      </div>

      {/* Price */}
      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-2xl font-bold">{formattedPrice}</span>
        <div
          className={cn(
            "flex items-center gap-1 text-sm font-medium",
            isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400",
          )}
        >
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>
            {isPositive ? "+" : ""}
            {displayChange.toFixed(2)} ({isPositive ? "+" : ""}
            {changePercent.toFixed(2)}%)
          </span>
        </div>
      </div>

      {/* Market Cap */}
      {displayMarketCap && displayMarketCap > 0 && (
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>Market Cap: {formatMarketCap(displayMarketCap, displayCurrency)}</span>
        </div>
      )}
    </div>
  );
}
