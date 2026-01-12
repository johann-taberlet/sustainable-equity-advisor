/**
 * A2UI (Agent-to-User Interface) Types
 * Based on Google's A2UI protocol for rich generative UI
 */

export interface A2UIComponent {
  component: string;
  props?: Record<string, unknown>;
}

export interface A2UISurfaceUpdate {
  surfaceUpdate: {
    component: string;
    props?: Record<string, unknown>;
  };
}

export interface A2UIMessage {
  text?: string;
  components?: A2UIComponent[];
}

// Financial component props
export interface PortfolioSummaryCardProps {
  totalValue: number;
  currency: string;
  change: number;
  changePercent: number;
  esgScore?: number;
}

export interface ESGScoreGaugeProps {
  score: number;
  environmental?: number;
  social?: number;
  governance?: number;
}

export interface HoldingProps {
  symbol: string;
  name: string;
  shares: number;
  value: number;
  esgScore?: number;
}

export interface HoldingsListProps {
  holdings: HoldingProps[];
  currency?: string;
  /** If true, values are in USD and will be converted using useCurrency */
  baseUSD?: boolean;
}

export interface ActionButtonProps {
  label: string;
  action: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
}

export interface ESGRadarChartProps {
  symbol: string;
  companyName: string;
  environmental: number;
  social: number;
  governance: number;
}

export interface ESGComparisonChartProps {
  companies: Array<{
    symbol: string;
    name: string;
    esgScore: number;
    environmental?: number;
    social?: number;
    governance?: number;
  }>;
}
