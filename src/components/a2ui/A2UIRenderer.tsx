"use client";

import type { A2UIComponent } from "@/lib/a2ui/types";
import { PortfolioSummaryCard } from "./PortfolioSummaryCard";
import { ESGScoreGauge } from "./ESGScoreGauge";
import { HoldingsList } from "./HoldingsList";
import { ActionButton } from "./ActionButton";
import { ActionConfirmation } from "./ActionConfirmation";
import type { ComponentType } from "react";

// Component registry mapping A2UI component names to React components
// Using 'unknown' cast to handle varying prop types safely
const componentRegistry: Record<string, ComponentType<Record<string, unknown>>> = {
  PortfolioSummaryCard: PortfolioSummaryCard as unknown as ComponentType<Record<string, unknown>>,
  ESGScoreGauge: ESGScoreGauge as unknown as ComponentType<Record<string, unknown>>,
  HoldingsList: HoldingsList as unknown as ComponentType<Record<string, unknown>>,
  ActionButton: ActionButton as unknown as ComponentType<Record<string, unknown>>,
  ActionConfirmation: ActionConfirmation as unknown as ComponentType<Record<string, unknown>>,
};

interface A2UIRendererProps {
  components: A2UIComponent[];
  onAction?: (action: string) => void;
}

export function A2UIRenderer({ components, onAction }: A2UIRendererProps) {
  return (
    <div className="space-y-4" data-testid="a2ui-component">
      {components.map((component, index) => {
        const Component = componentRegistry[component.component];

        if (!Component) {
          return (
            <div
              key={index}
              className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
            >
              Unknown component: {component.component}
            </div>
          );
        }

        return (
          <Component key={index} {...(component.props || {})} onAction={onAction} />
        );
      })}
    </div>
  );
}
