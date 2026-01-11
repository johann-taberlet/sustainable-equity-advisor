"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function AIPanel({ isOpen, onClose, children }: AIPanelProps) {
  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      data-testid="ai-panel"
      role="dialog"
      aria-modal="true"
      aria-label="AI Assistant"
      className="flex h-full w-full flex-col bg-background border-l shadow-lg"
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        <h2 className="text-lg font-semibold">AI Assistant</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close AI assistant"
          data-testid="ai-panel-close"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
