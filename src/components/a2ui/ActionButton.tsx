"use client";

import { Button } from "@/components/ui/button";
import type { ActionButtonProps } from "@/lib/a2ui/types";

interface ActionButtonComponentProps extends ActionButtonProps {
  onAction?: (action: string) => void;
}

export function ActionButton({
  label,
  action,
  variant = "outline",
  onAction,
}: ActionButtonComponentProps) {
  return (
    <Button
      data-a2ui="ActionButton"
      data-a2ui-action={action}
      data-action={action}
      variant={variant}
      size="sm"
      className="text-xs"
      onClick={() => onAction?.(action)}
    >
      {label}
    </Button>
  );
}
