"use client";

import { ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CURRENCIES, useCurrency } from "@/lib/currency";

function ChatbotIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
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
  const selectedPortfolio = portfolios.find(
    (p) => p.id === selectedPortfolioId,
  );

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
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
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
