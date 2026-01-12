/**
 * Price Alert utilities for demo localStorage persistence
 * In production, this would use a backend database for reliability
 */

export interface PriceAlert {
  id: string;
  symbol: string;
  operator: "gt" | "lt" | "gte" | "lte";
  targetPrice: number;
  createdAt: string;
  status: "active" | "triggered" | "dismissed";
}

const STORAGE_KEY = "price_alerts";

/**
 * Get all alerts from localStorage
 */
export function getAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Save a new alert
 */
export function saveAlert(
  alert: Omit<PriceAlert, "id" | "createdAt">,
): PriceAlert {
  const newAlert: PriceAlert = {
    ...alert,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const alerts = getAlerts();
  alerts.push(newAlert);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));

  return newAlert;
}

/**
 * Update an alert's status
 */
export function updateAlertStatus(
  id: string,
  status: PriceAlert["status"],
): void {
  const alerts = getAlerts().map((a) => (a.id === id ? { ...a, status } : a));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

/**
 * Dismiss an alert
 */
export function dismissAlert(id: string): void {
  updateAlertStatus(id, "dismissed");
}

/**
 * Delete an alert
 */
export function deleteAlert(id: string): void {
  const alerts = getAlerts().filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

/**
 * Get active alerts only
 */
export function getActiveAlerts(): PriceAlert[] {
  return getAlerts().filter((a) => a.status === "active");
}

/**
 * Check if an alert should trigger based on current price
 */
export function shouldTrigger(
  alert: PriceAlert,
  currentPrice: number,
): boolean {
  switch (alert.operator) {
    case "gt":
      return currentPrice > alert.targetPrice;
    case "gte":
      return currentPrice >= alert.targetPrice;
    case "lt":
      return currentPrice < alert.targetPrice;
    case "lte":
      return currentPrice <= alert.targetPrice;
    default:
      return false;
  }
}

/**
 * Get operator display text
 */
export function getOperatorText(operator: PriceAlert["operator"]): string {
  switch (operator) {
    case "gt":
      return "above";
    case "gte":
      return "at or above";
    case "lt":
      return "below";
    case "lte":
      return "at or below";
    default:
      return "";
  }
}

/**
 * Parse alert type from LLM action to operator
 */
export function parseAlertType(
  alertType: string,
): PriceAlert["operator"] | null {
  const type = alertType.toLowerCase();
  if (type.includes("above")) return "gt";
  if (type.includes("below")) return "lt";
  return null;
}
