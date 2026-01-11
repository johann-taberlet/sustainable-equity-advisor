import { Database } from "lucide-react";

interface DataQueryBadgeProps {
  tools: string[];
}

const toolLabels: Record<string, string> = {
  get_portfolio: "Portfolio data",
  get_holding: "Holding details",
};

export function DataQueryBadge({ tools }: DataQueryBadgeProps) {
  if (!tools || tools.length === 0) return null;

  // Get unique tool names and their labels
  const uniqueTools = [...new Set(tools)];
  const labels = uniqueTools.map((t) => toolLabels[t] || t).join(", ");

  return (
    <div
      data-testid="data-query-badge"
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground mb-2"
    >
      <Database className="h-3 w-3" />
      <span>{labels} queried</span>
    </div>
  );
}
