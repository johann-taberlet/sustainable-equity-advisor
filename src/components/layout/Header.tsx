"use client";

import { Bell, ChevronDown, Info, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  deleteAlert,
  getActiveAlerts,
  getOperatorText,
  type PriceAlert,
} from "@/lib/alerts";
import { CURRENCIES, useCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

function ChatbotIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-labelledby="chatbot-icon-title"
    >
      <title id="chatbot-icon-title">AI Assistant</title>
      <rect
        x="4"
        y="6"
        width="16"
        height="14"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="9" cy="11" r="1.5" fill="currentColor" />
      <circle cx="15" cy="11" r="1.5" fill="currentColor" />
      <path
        d="M12 6V3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="2" r="1" fill="currentColor" />
      <path
        d="M9 16H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface Portfolio {
  id: string;
  name: string;
}

interface HeaderProps {
  portfolios?: Portfolio[];
  selectedPortfolioId?: string;
  onPortfolioChange?: (id: string) => void;
  onAIChatToggle?: () => void;
  isAIPanelOpen?: boolean;
}

export function Header({
  portfolios = [],
  selectedPortfolioId,
  onPortfolioChange,
  onAIChatToggle,
  isAIPanelOpen,
}: HeaderProps) {
  const { currency, setCurrency } = useCurrency();
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const selectedPortfolio = portfolios.find(
    (p) => p.id === selectedPortfolioId,
  );

  // Load alerts on mount and listen for changes
  useEffect(() => {
    const loadAlerts = () => setAlerts(getActiveAlerts());
    loadAlerts();

    // Listen for storage changes (from other tabs or alert creation)
    const handleStorage = () => loadAlerts();
    window.addEventListener("storage", handleStorage);

    // Also refresh periodically to catch new alerts from same tab
    const interval = setInterval(loadAlerts, 2000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const handleDeleteAlert = (id: string) => {
    deleteAlert(id);
    setAlerts(getActiveAlerts());
  };

  return (
    <div className="flex flex-1 items-center justify-between">
      {/* Left: Breadcrumb / Section title */}
      <div className="flex items-center gap-2">
        {/* Portfolio selector */}
        {portfolios.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2"
                data-testid="portfolio-selector"
              >
                <span>{selectedPortfolio?.name || "Select Portfolio"}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {portfolios.map((portfolio) => (
                <DropdownMenuItem
                  key={portfolio.id}
                  onClick={() => onPortfolioChange?.(portfolio.id)}
                  data-testid={`portfolio-option-${portfolio.id}`}
                >
                  {portfolio.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Currency selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 min-w-[80px]"
              data-testid="currency-selector"
            >
              <span>{currency}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {CURRENCIES.map((curr) => (
              <DropdownMenuItem
                key={curr.value}
                onClick={() => setCurrency(curr.value)}
                data-testid={`currency-option-${curr.value}`}
                className={cn(currency === curr.value && "bg-accent")}
              >
                {curr.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Demo disclaimer */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Info className="h-3.5 w-3.5" />
              <span>Demo</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-sm" align="start">
            <div className="space-y-2">
              <p className="font-medium">Demo Limitations</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li>US market only (NASDAQ, NYSE)</li>
                <li>ESG scores are static (curated dataset)</li>
                <li>Stock prices delayed ~15 min</li>
                <li>Portfolio data is simulated</li>
              </ul>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Alerts dropdown */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="View price alerts"
            >
              <Bell className="h-5 w-5" />
              {alerts.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {alerts.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-2">
              <p className="font-medium">Price Alerts</p>
              {alerts.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No active alerts. Ask the AI to set one!
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex items-center justify-between rounded-md border p-2"
                    >
                      <div className="text-sm">
                        <span className="font-medium">{alert.symbol}</span>{" "}
                        <span className="text-muted-foreground">
                          {getOperatorText(alert.operator)} ${alert.targetPrice}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteAlert(alert.id)}
                        aria-label={`Delete alert for ${alert.symbol}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <ThemeToggle />

        {/* AI Chat toggle with chatbot icon */}
        {onAIChatToggle && (
          <Button
            variant={isAIPanelOpen ? "default" : "ghost"}
            size="icon"
            onClick={onAIChatToggle}
            data-testid="ai-chat-toggle"
            aria-label={
              isAIPanelOpen ? "Close AI assistant" : "Open AI assistant"
            }
            className={cn(
              "relative",
              isAIPanelOpen && "bg-primary text-primary-foreground",
            )}
          >
            <ChatbotIcon className="h-6 w-6" />
            {!isAIPanelOpen && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
