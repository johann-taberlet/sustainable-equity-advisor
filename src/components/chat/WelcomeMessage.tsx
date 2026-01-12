"use client";

import { Button } from "@/components/ui/button";

interface WelcomeMessageProps {
  onAction: (action: string) => void;
}

export function WelcomeMessage({ onAction }: WelcomeMessageProps) {
  return (
    <div className="rounded-lg bg-muted p-4 space-y-4">
      <div className="space-y-2">
        <p className="text-sm">
          Welcome to Montblanc Capital! I'm your ESG investment advisor. I've
          set up a sample portfolio with 5 holdings across different sectors to
          show you around.
        </p>
        <p className="text-sm text-muted-foreground">
          Try asking me to{" "}
          <span className="text-primary">"add 10 shares of NVDA"</span> or{" "}
          <span className="text-primary">"compare my holdings"</span> to see how
          I can help manage your sustainable investments.
        </p>
      </div>

      {/* Portfolio Management */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Portfolio Management
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onAction("view-portfolio")}
          >
            View Portfolio
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("add-holding")}
          >
            Add Holdings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("remove-holding")}
          >
            Remove Holdings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("view-esg")}
          >
            ESG Breakdown
          </Button>
        </div>
      </div>

      {/* Research & Analysis */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Research & Analysis
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onAction("research-stocks")}
          >
            Research a Stock
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("compare-holdings")}
          >
            Compare ESG Scores
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("filter-holdings")}
          >
            Filter Holdings
          </Button>
        </div>
      </div>

      {/* Alerts & Navigation */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Alerts & Navigation
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onAction("set-alert")}
          >
            Set Price Alert
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("navigate-screening")}
          >
            ESG Screening
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAction("navigate-holdings")}
          >
            Holdings Table
          </Button>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="space-y-2 pt-2 border-t">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Try asking
        </h4>
        <div className="grid grid-cols-1 gap-1">
          <button
            type="button"
            className="text-left text-sm text-primary hover:underline"
            onClick={() => onAction("example-add")}
          >
            "Add 10 shares of Apple"
          </button>
          <button
            type="button"
            className="text-left text-sm text-primary hover:underline"
            onClick={() => onAction("example-compare")}
          >
            "Compare AAPL and MSFT ESG scores"
          </button>
          <button
            type="button"
            className="text-left text-sm text-primary hover:underline"
            onClick={() => onAction("example-alert")}
          >
            "Alert me when TSLA goes above 300"
          </button>
          <button
            type="button"
            className="text-left text-sm text-primary hover:underline"
            onClick={() => onAction("example-filter")}
          >
            "Show tech stocks with ESG above 70"
          </button>
        </div>
      </div>
    </div>
  );
}
