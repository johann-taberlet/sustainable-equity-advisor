"use client";

import { Check, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PendingAction } from "@/lib/ai/actions";

interface ActionConfirmationProps {
  action: PendingAction;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}

export function ActionConfirmation({
  action,
  onConfirm,
  onCancel,
}: ActionConfirmationProps) {
  if (action.executed) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CardContent className="flex items-center gap-2 p-3">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-800 dark:text-green-200">
            {action.description} - Done
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
      data-testid="action-confirmation"
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Confirm action
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              {action.description}
            </p>
            <div className="mt-2 flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => onConfirm(action.id)}
                data-testid="confirm-action"
              >
                <Check className="mr-1 h-3 w-3" />
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCancel(action.id)}
                data-testid="cancel-action"
              >
                <X className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ActionToastProps {
  message: string;
  success: boolean;
  onUndo?: () => void;
}

export function ActionToast({ message, success, onUndo }: ActionToastProps) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-3 shadow-lg ${
        success
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
      role="alert"
      data-testid="action-toast"
    >
      {success ? (
        <Check className="h-4 w-4" />
      ) : (
        <X className="h-4 w-4" />
      )}
      <span className="flex-1 text-sm">{message}</span>
      {onUndo && (
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/20"
          onClick={onUndo}
        >
          Undo
        </Button>
      )}
    </div>
  );
}

interface ActionListProps {
  actions: PendingAction[];
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
}

export function ActionList({ actions, onConfirm, onCancel }: ActionListProps) {
  const pendingActions = actions.filter((a) => !a.executed);

  if (pendingActions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2" data-testid="action-list">
      {pendingActions.map((action) => (
        <ActionConfirmation
          key={action.id}
          action={action}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}
