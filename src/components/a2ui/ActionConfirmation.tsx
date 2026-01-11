"use client";

import { Check, Plus, Minus, Filter, Bell, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionConfirmationProps {
  actionType: "add_holding" | "remove_holding" | "update_holding" | "filter_holdings" | "create_alert" | "navigate";
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
  const getIcon = () => {
    switch (actionType) {
      case "add_holding":
      case "update_holding":
        return <Plus className="h-4 w-4" />;
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

  const getMessage = () => {
    switch (actionType) {
      case "add_holding":
        if (previousShares && previousShares > 0) {
          return (
            <>
              <span className="font-semibold">{symbol}</span>
              <span className="text-muted-foreground mx-1">·</span>
              <span className="text-green-600 dark:text-green-400">+{shares} shares</span>
              <span className="text-muted-foreground mx-1">→</span>
              <span className="font-medium">{newTotal} total</span>
            </>
          );
        }
        return (
          <>
            <span className="font-semibold">{symbol}</span>
            <span className="text-muted-foreground mx-1">·</span>
            <span className="text-green-600 dark:text-green-400">{shares} shares added</span>
            {name && <span className="text-muted-foreground ml-1">({name})</span>}
          </>
        );
      case "remove_holding":
        return (
          <>
            <span className="font-semibold">{symbol}</span>
            <span className="text-muted-foreground mx-1">·</span>
            <span className="text-red-600 dark:text-red-400">Removed from portfolio</span>
          </>
        );
      case "update_holding":
        return (
          <>
            <span className="font-semibold">{symbol}</span>
            <span className="text-muted-foreground mx-1">·</span>
            <span>Updated to {shares} shares</span>
          </>
        );
      case "filter_holdings":
        return (
          <>
            <span>Filtered:</span>
            <span className="font-medium ml-1">{filterCriteria}</span>
          </>
        );
      case "create_alert":
        return (
          <>
            <span className="font-semibold">{symbol}</span>
            <span className="text-muted-foreground mx-1">·</span>
            <span>Alert created</span>
          </>
        );
      case "navigate":
        return (
          <>
            <span>Navigated to</span>
            <span className="font-medium ml-1 capitalize">{section}</span>
          </>
        );
      default:
        return <span>Action completed</span>;
    }
  };

  const getBgColor = () => {
    switch (actionType) {
      case "add_holding":
      case "update_holding":
        return "bg-green-500/10 border-green-500/20";
      case "remove_holding":
        return "bg-red-500/10 border-red-500/20";
      default:
        return "bg-primary/10 border-primary/20";
    }
  };

  const getIconColor = () => {
    switch (actionType) {
      case "add_holding":
      case "update_holding":
        return "text-green-600 dark:text-green-400 bg-green-500/20";
      case "remove_holding":
        return "text-red-600 dark:text-red-400 bg-red-500/20";
      default:
        return "text-primary bg-primary/20";
    }
  };

  return (
    <div
      data-testid="action-confirmation"
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2 mt-2",
        getBgColor()
      )}
    >
      <div className={cn("flex h-6 w-6 items-center justify-center rounded-full", getIconColor())}>
        {getIcon()}
      </div>
      <div className="flex items-center text-sm">
        {getMessage()}
      </div>
      <Check className="ml-auto h-4 w-4 text-green-600 dark:text-green-400" />
    </div>
  );
}
