"use client";

import { ChevronDown, MessageSquare, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
  const selectedPortfolio = portfolios.find(
    (p) => p.id === selectedPortfolioId,
  );

  return (
    <div className="flex flex-1 items-center justify-between">
      {/* Left: Breadcrumb / Section title */}
      <div className="flex items-center gap-4">
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
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* AI Chat toggle */}
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
            <MessageSquare className="h-5 w-5" />
            {!isAIPanelOpen && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-green-500" />
            )}
          </Button>
        )}

        <ThemeToggle />

        {/* User menu placeholder */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              data-testid="user-menu"
              aria-label="User menu"
            >
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>Profile</DropdownMenuItem>
            <DropdownMenuItem disabled>Settings</DropdownMenuItem>
            <DropdownMenuItem disabled>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
