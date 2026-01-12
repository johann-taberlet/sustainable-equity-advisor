"use client";

import type { ComponentType } from "react";
import type { A2UIComponent } from "@/lib/a2ui/types";
import { ActionButton } from "./ActionButton";
import { ActionConfirmation } from "./ActionConfirmation";
import { ESGComparisonChart } from "./ESGComparisonChart";
import { ESGRadarChart } from "./ESGRadarChart";
import { ESGScoreGauge } from "./ESGScoreGauge";
import { HoldingCard } from "./HoldingCard";
import { HoldingsList } from "./HoldingsList";
import { PortfolioSummaryCard } from "./PortfolioSummaryCard";
import { StockInfoCard } from "./StockInfoCard";

// Component registry mapping A2UI component names to React components
// Using 'unknown' cast to handle varying prop types safely
const componentRegistry: Record<
  string,
  ComponentType<Record<string, unknown>>
> = {
  PortfolioSummaryCard: PortfolioSummaryCard as unknown as ComponentType<
    Record<string, unknown>
  >,
  ESGScoreGauge: ESGScoreGauge as unknown as ComponentType<
    Record<string, unknown>
  >,
  ESGRadarChart: ESGRadarChart as unknown as ComponentType<
    Record<string, unknown>
  >,
  ESGComparisonChart: ESGComparisonChart as unknown as ComponentType<
    Record<string, unknown>
  >,
  HoldingsList: HoldingsList as unknown as ComponentType<
    Record<string, unknown>
  >,
  HoldingCard: HoldingCard as unknown as ComponentType<Record<string, unknown>>,
  StockInfoCard: StockInfoCard as unknown as ComponentType<
    Record<string, unknown>
  >,
  ActionButton: ActionButton as unknown as ComponentType<
    Record<string, unknown>
  >,
  ActionConfirmation: ActionConfirmation as unknown as ComponentType<
    Record<string, unknown>
  >,
};

interface A2UIRendererProps {
  components: A2UIComponent[];
  onAction?: (action: string) => void;
}

export function A2UIRenderer({ components, onAction }: A2UIRendererProps) {
  // Group consecutive ActionButtons together
  const groupedComponents: Array<{
    type: "single" | "button-group";
    items: Array<{ component: (typeof components)[0]; index: number }>;
  }> = [];

  for (let i = 0; i < components.length; i++) {
    const component = components[i];
    if (component.component === "ActionButton") {
      // Start or continue a button group
      const lastGroup = groupedComponents[groupedComponents.length - 1];
      if (lastGroup?.type === "button-group") {
        lastGroup.items.push({ component, index: i });
      } else {
        groupedComponents.push({
          type: "button-group",
          items: [{ component, index: i }],
        });
      }
    } else {
      groupedComponents.push({
        type: "single",
        items: [{ component, index: i }],
      });
    }
  }

  return (
    <div className="space-y-3" data-testid="a2ui-component">
      {groupedComponents.map((group) => {
        // Use the first item's index as a stable key since items maintain their original order
        const groupKey = `group-${group.items[0].index}`;
        if (group.type === "button-group") {
          return (
            <div key={groupKey} className="flex flex-wrap gap-2">
              {group.items.map(({ component, index }) => {
                const Component = componentRegistry[component.component];
                return Component ? (
                  <Component
                    key={index}
                    {...(component.props || {})}
                    onAction={onAction}
                  />
                ) : null;
              })}
            </div>
          );
        }

        const { component, index } = group.items[0];
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
          <Component
            key={index}
            {...(component.props || {})}
            onAction={onAction}
          />
        );
      })}
    </div>
  );
}
