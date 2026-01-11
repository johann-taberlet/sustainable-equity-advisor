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
        return <Plus className="h-3.5 w-3.5" />;
      case "remove_holding":
        return <Minus className="h-3.5 w-3.5" />;
      case "filter_holdings":
        return <Filter className="h-3.5 w-3.5" />;
      case "create_alert":
        return <Bell className="h-3.5 w-3.5" />;
      case "navigate":
        return <ArrowRight className="h-3.5 w-3.5" />;
      default:
        return <Check className="h-3.5 w-3.5" />;
    }
  };

  const getIconColor = () => {
    switch (actionType) {
      case "add_holding":
      case "update_holding":
        return "text-green-600 dark:text-green-400";
      case "remove_holding":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-primary";
    }
  };

  const getTextColor = () => {
    switch (actionType) {
      case "add_holding":
      case "update_holding":
        return "text-green-600 dark:text-green-400";
      case "remove_holding":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-foreground";
    }
  };

  const renderContent = () => {
    switch (actionType) {
      case "add_holding":
        if (previousShares && previousShares > 0) {
          return (
            <span className={getTextColor()}>
              +{shares} {symbol} → {newTotal} total
            </span>
          );
        }
        return (
          <span className={getTextColor()}>
            +{shares} {symbol} added
          </span>
        );
      case "remove_holding":
        return (
          <span className={getTextColor()}>
            {symbol} removed
          </span>
        );
      case "update_holding":
        return (
          <span className={getTextColor()}>
            {symbol} → {shares} shares
          </span>
        );
      case "filter_holdings":
        return <span>Filtered: {filterCriteria}</span>;
      case "create_alert":
        return <span>Alert set for {symbol}</span>;
      case "navigate":
        return <span className="capitalize">Viewing {section}</span>;
      default:
        return <span>Done</span>;
    }
  };

  return (
    <div
      data-testid="action-confirmation"
      className="inline-flex items-center gap-1.5 mt-2 text-sm"
    >
      <span className={cn("flex items-center", getIconColor())}>
        {getIcon()}
      </span>
      {renderContent()}
      <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 ml-1" />
    </div>
  );
}
