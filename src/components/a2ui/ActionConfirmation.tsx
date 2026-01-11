"use client";

import {
  Check,
  Plus,
  Minus,
  Filter,
  Bell,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionConfirmationProps {
  actionType:
    | "add_holding"
    | "remove_holding"
    | "update_holding"
    | "filter_holdings"
    | "create_alert"
    | "navigate";
  symbol?: string;
  shares?: number;
  name?: string;
  previousShares?: number;
  newTotal?: number;
  section?: string;
  filterCriteria?: string;
}

export function ActionConfirmation({
  actionType,
  symbol,
  shares,
  name,
  previousShares,
  newTotal,
  section,
  filterCriteria,
}: ActionConfirmationProps) {
  const isAdd = actionType === "add_holding" || actionType === "update_holding";
  const isRemove = actionType === "remove_holding";

  const getBgColor = () => {
    if (isAdd)
      return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
    if (isRemove)
      return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
    return "bg-card border-border";
  };

  const getIconBg = () => {
    if (isAdd) return "bg-green-100 dark:bg-green-900/50";
    if (isRemove) return "bg-red-100 dark:bg-red-900/50";
    return "bg-muted";
  };

  const getIconColor = () => {
    if (isAdd) return "text-green-600 dark:text-green-400";
    if (isRemove) return "text-red-600 dark:text-red-400";
    return "text-primary";
  };

  const getIcon = () => {
    switch (actionType) {
      case "add_holding":
        return <Plus className="h-4 w-4" />;
      case "update_holding":
        return <TrendingUp className="h-4 w-4" />;
      case "remove_holding":
        return <Minus className="h-4 w-4" />;
      case "filter_holdings":
        return <Filter className="h-4 w-4" />;
      case "create_alert":
        return <Bell className="h-4 w-4" />;
      case "navigate":
        return <ArrowRight className="h-4 w-4" />;
      default:
        return <Check className="h-4 w-4" />;
    }
  };

  const getTitle = () => {
    switch (actionType) {
      case "add_holding":
        return previousShares && previousShares > 0
          ? "Position Updated"
          : "Position Added";
      case "remove_holding":
        return "Position Removed";
      case "update_holding":
        return "Position Updated";
      case "filter_holdings":
        return "Filter Applied";
      case "create_alert":
        return "Alert Created";
      case "navigate":
        return "Navigation";
      default:
        return "Action Complete";
    }
  };

  const getDescription = () => {
    switch (actionType) {
      case "add_holding":
        if (previousShares && previousShares > 0) {
          return `+${shares} shares of ${symbol} (${newTotal} total)`;
        }
        return `${shares} shares of ${symbol}`;
      case "remove_holding":
        return `${symbol} removed from portfolio`;
      case "update_holding":
        return `${symbol} updated to ${shares} shares`;
      case "filter_holdings":
        return filterCriteria || "Filter applied";
      case "create_alert":
        return `Alert set for ${symbol}`;
      case "navigate":
        return `Now viewing ${section}`;
      default:
        return "Action completed successfully";
    }
  };

  return (
    <div
      data-testid="action-confirmation"
      className={cn("mt-3 rounded-lg border p-3 shadow-sm", getBgColor())}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex items-center justify-center rounded-full p-2",
            getIconBg(),
          )}
        >
          <span className={getIconColor()}>{getIcon()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{getTitle()}</span>
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-muted-foreground">{getDescription()}</p>
        </div>
      </div>
    </div>
  );
}
