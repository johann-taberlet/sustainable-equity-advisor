"use client";

import { useCallback, useState } from "react";
import type { NavigationSection } from "@/components/layout/Sidebar";
import {
  type ActionResult,
  type AIAction,
  getActionDescription,
  type PendingAction,
  validateAction,
} from "@/lib/ai/actions";

// Regex to extract action JSON from AI response
const ACTION_REGEX = /\{"action":\s*\{[^}]+\}\}/g;

export interface AIActionsState {
  pendingActions: PendingAction[];
  highlightedSymbols: string[];
  comparisonSymbols: string[];
  holdingsFilter: {
    sector?: string;
    minEsg?: number;
    maxEsg?: number;
  } | null;
}

interface UseAIActionsOptions {
  onNavigate?: (section: NavigationSection) => void;
  onAddHolding?: (symbol: string, shares: number, name?: string) => void;
  onRemoveHolding?: (symbol: string) => void;
  onCreateAlert?: (
    symbol: string,
    alertType: string,
    value: number,
  ) => Promise<void>;
}

export function useAIActions(options: UseAIActionsOptions = {}) {
  const [state, setState] = useState<AIActionsState>({
    pendingActions: [],
    highlightedSymbols: [],
    comparisonSymbols: [],
    holdingsFilter: null,
  });

  // Parse actions from AI response text
  const parseActions = useCallback((response: string): AIAction[] => {
    const actions: AIAction[] = [];
    const matches = response.match(ACTION_REGEX);

    if (matches) {
      for (const match of matches) {
        try {
          const parsed = JSON.parse(match);
          if (parsed.action && validateAction(parsed.action)) {
            actions.push(parsed.action);
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }

    return actions;
  }, []);

  // Execute a single action
  const executeAction = useCallback(
    async (action: AIAction): Promise<ActionResult> => {
      try {
        switch (action.type) {
          case "filter_holdings":
            setState((prev) => ({
              ...prev,
              holdingsFilter: action.payload,
            }));
            return {
              success: true,
              message: `Holdings filtered${action.payload.sector ? ` by ${action.payload.sector}` : ""}`,
            };

          case "add_holding":
            if (options.onAddHolding) {
              options.onAddHolding(
                action.payload.symbol,
                action.payload.shares,
                action.payload.name,
              );
            }
            return {
              success: true,
              message: `Added ${action.payload.shares} shares of ${action.payload.symbol}`,
            };

          case "remove_holding":
            if (options.onRemoveHolding) {
              options.onRemoveHolding(action.payload.symbol);
            }
            return {
              success: true,
              message: `Removed ${action.payload.symbol} from portfolio`,
            };

          case "create_alert":
            if (options.onCreateAlert) {
              await options.onCreateAlert(
                action.payload.symbol,
                action.payload.alertType,
                action.payload.value,
              );
            }
            return {
              success: true,
              message: `Alert created for ${action.payload.symbol}`,
            };

          case "navigate":
            if (options.onNavigate) {
              options.onNavigate(action.payload.section);
            }
            return {
              success: true,
              message: `Navigated to ${action.payload.section}`,
            };

          case "highlight":
            setState((prev) => ({
              ...prev,
              highlightedSymbols: action.payload.symbols,
            }));
            return {
              success: true,
              message: `Highlighted: ${action.payload.symbols.join(", ")}`,
            };

          case "show_comparison":
            setState((prev) => ({
              ...prev,
              comparisonSymbols: action.payload.symbols,
            }));
            return {
              success: true,
              message: `Comparing: ${action.payload.symbols.join(" vs ")}`,
            };

          default:
            return { success: false, message: "Unknown action type" };
        }
      } catch (error) {
        return {
          success: false,
          message: `Action failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    },
    [options],
  );

  // Add action to pending queue
  const queueAction = useCallback((action: AIAction) => {
    const pendingAction: PendingAction = {
      id: crypto.randomUUID(),
      action,
      description: getActionDescription(action),
      confirmed: false,
      executed: false,
    };

    setState((prev) => ({
      ...prev,
      pendingActions: [...prev.pendingActions, pendingAction],
    }));

    return pendingAction.id;
  }, []);

  // Confirm and execute a pending action
  const confirmAction = useCallback(
    async (actionId: string): Promise<ActionResult> => {
      const pendingAction = state.pendingActions.find((a) => a.id === actionId);
      if (!pendingAction) {
        return { success: false, message: "Action not found" };
      }

      const result = await executeAction(pendingAction.action);

      setState((prev) => ({
        ...prev,
        pendingActions: prev.pendingActions.map((a) =>
          a.id === actionId ? { ...a, confirmed: true, executed: true } : a,
        ),
      }));

      return result;
    },
    [state.pendingActions, executeAction],
  );

  // Cancel a pending action
  const cancelAction = useCallback((actionId: string) => {
    setState((prev) => ({
      ...prev,
      pendingActions: prev.pendingActions.filter((a) => a.id !== actionId),
    }));
  }, []);

  // Clear highlight/comparison states
  const clearHighlights = useCallback(() => {
    setState((prev) => ({
      ...prev,
      highlightedSymbols: [],
    }));
  }, []);

  const clearComparison = useCallback(() => {
    setState((prev) => ({
      ...prev,
      comparisonSymbols: [],
    }));
  }, []);

  const clearFilter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      holdingsFilter: null,
    }));
  }, []);

  // Process AI response and queue/execute actions
  const processResponse = useCallback(
    async (
      response: string,
      autoExecute = false,
    ): Promise<{ actions: AIAction[]; results: ActionResult[] }> => {
      const actions = parseActions(response);
      const results: ActionResult[] = [];

      for (const action of actions) {
        if (autoExecute) {
          // Auto-execute safe actions (navigate, highlight, filter)
          const safeActions = ["navigate", "highlight", "filter_holdings"];
          if (safeActions.includes(action.type)) {
            const result = await executeAction(action);
            results.push(result);
          } else {
            // Queue potentially destructive actions for confirmation
            queueAction(action);
            results.push({
              success: true,
              message: `Action queued for confirmation: ${getActionDescription(action)}`,
            });
          }
        } else {
          queueAction(action);
          results.push({
            success: true,
            message: `Action queued: ${getActionDescription(action)}`,
          });
        }
      }

      return { actions, results };
    },
    [parseActions, executeAction, queueAction],
  );

  return {
    state,
    parseActions,
    executeAction,
    queueAction,
    confirmAction,
    cancelAction,
    processResponse,
    clearHighlights,
    clearComparison,
    clearFilter,
  };
}
