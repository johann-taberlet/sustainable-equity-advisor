import type { NavigationSection } from "@/components/layout/Sidebar";

// Action type definitions
export type AIActionType =
  | "filter_holdings"
  | "add_holding"
  | "remove_holding"
  | "create_alert"
  | "navigate"
  | "highlight"
  | "show_comparison";

// Alert condition types
export type AlertType = "price_above" | "price_below" | "esg_change";

export interface AlertCondition {
  type: AlertType;
  value: number;
}

// Individual action payloads
export interface FilterHoldingsAction {
  type: "filter_holdings";
  payload: {
    sector?: string;
    minEsg?: number;
    maxEsg?: number;
  };
}

export interface AddHoldingAction {
  type: "add_holding";
  payload: {
    symbol: string;
    shares: number;
    name?: string;
  };
}

export interface RemoveHoldingAction {
  type: "remove_holding";
  payload: {
    symbol: string;
  };
}

export interface CreateAlertAction {
  type: "create_alert";
  payload: {
    symbol: string;
    alertType: AlertType;
    value: number;
  };
}

export interface NavigateAction {
  type: "navigate";
  payload: {
    section: NavigationSection;
  };
}

export interface HighlightAction {
  type: "highlight";
  payload: {
    symbols: string[];
  };
}

export interface ShowComparisonAction {
  type: "show_comparison";
  payload: {
    symbols: string[];
  };
}

// Union type for all actions
export type AIAction =
  | FilterHoldingsAction
  | AddHoldingAction
  | RemoveHoldingAction
  | CreateAlertAction
  | NavigateAction
  | HighlightAction
  | ShowComparisonAction;

// Action result
export interface ActionResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// Action with confirmation state
export interface PendingAction {
  id: string;
  action: AIAction;
  description: string;
  confirmed: boolean;
  executed: boolean;
}

// Type guards for action validation
export function isFilterHoldingsAction(
  action: AIAction,
): action is FilterHoldingsAction {
  return action.type === "filter_holdings";
}

export function isAddHoldingAction(
  action: AIAction,
): action is AddHoldingAction {
  return action.type === "add_holding";
}

export function isRemoveHoldingAction(
  action: AIAction,
): action is RemoveHoldingAction {
  return action.type === "remove_holding";
}

export function isCreateAlertAction(
  action: AIAction,
): action is CreateAlertAction {
  return action.type === "create_alert";
}

export function isNavigateAction(action: AIAction): action is NavigateAction {
  return action.type === "navigate";
}

export function isHighlightAction(action: AIAction): action is HighlightAction {
  return action.type === "highlight";
}

export function isShowComparisonAction(
  action: AIAction,
): action is ShowComparisonAction {
  return action.type === "show_comparison";
}

// Validate action payload
export function validateAction(action: unknown): action is AIAction {
  if (!action || typeof action !== "object") return false;
  const a = action as { type?: string; payload?: unknown };

  if (!a.type || !a.payload) return false;

  switch (a.type) {
    case "filter_holdings":
      return typeof a.payload === "object";
    case "add_holding": {
      const p = a.payload as { symbol?: string; shares?: number };
      return typeof p.symbol === "string" && typeof p.shares === "number";
    }
    case "remove_holding": {
      const p = a.payload as { symbol?: string };
      return typeof p.symbol === "string";
    }
    case "create_alert": {
      const p = a.payload as {
        symbol?: string;
        alertType?: string;
        value?: number;
      };
      return (
        typeof p.symbol === "string" &&
        typeof p.alertType === "string" &&
        typeof p.value === "number"
      );
    }
    case "navigate": {
      const p = a.payload as { section?: string };
      return typeof p.section === "string";
    }
    case "highlight":
    case "show_comparison": {
      const p = a.payload as { symbols?: string[] };
      return Array.isArray(p.symbols);
    }
    default:
      return false;
  }
}

// Parse action from AI response JSON
export function parseActionFromResponse(json: string): AIAction | null {
  try {
    const parsed = JSON.parse(json);
    if (validateAction(parsed)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

// Get human-readable description for action
export function getActionDescription(action: AIAction): string {
  switch (action.type) {
    case "filter_holdings":
      return `Filter holdings${action.payload.sector ? ` by sector: ${action.payload.sector}` : ""}${action.payload.minEsg ? ` with ESG >= ${action.payload.minEsg}` : ""}`;
    case "add_holding":
      return `Add ${action.payload.shares} shares of ${action.payload.symbol}`;
    case "remove_holding":
      return `Remove ${action.payload.symbol} from portfolio`;
    case "create_alert":
      return `Create ${action.payload.alertType} alert for ${action.payload.symbol} at ${action.payload.value}`;
    case "navigate":
      return `Navigate to ${action.payload.section}`;
    case "highlight":
      return `Highlight: ${action.payload.symbols.join(", ")}`;
    case "show_comparison":
      return `Compare: ${action.payload.symbols.join(" vs ")}`;
    default:
      return "Unknown action";
  }
}
