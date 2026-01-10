"use client";

import type { A2UIComponent } from "@/lib/a2ui/types";
import { PortfolioSummaryCard } from "./PortfolioSummaryCard";
import { ESGScoreGauge } from "./ESGScoreGauge";
import { HoldingsList } from "./HoldingsList";
import { ActionButton } from "./ActionButton";
import type { ComponentType } from "react";

// Component registry mapping A2UI component names to React components
const componentRegistry: Record<string, ComponentType<Record<string, unknown>>> = {
  PortfolioSummaryCard: PortfolioSummaryCard as ComponentType<Record<string, unknown>>,
  ESGScoreGauge: ESGScoreGauge as ComponentType<Record<string, unknown>>,
  HoldingsList: HoldingsList as ComponentType<Record<string, unknown>>,
  ActionButton: ActionButton as ComponentType<Record<string, unknown>>,
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
