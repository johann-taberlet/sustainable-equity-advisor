"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop - transparent to keep dashboard visible */}
      <div
        data-testid="ai-panel-backdrop"
        className={cn(
          "fixed inset-0 z-40 transition-opacity duration-200",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        data-testid="ai-panel"
        role="dialog"
        aria-modal="true"
        aria-label="AI Assistant"
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-background shadow-2xl transition-transform duration-300 ease-out sm:w-[400px]",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
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
    </>
  );
}
