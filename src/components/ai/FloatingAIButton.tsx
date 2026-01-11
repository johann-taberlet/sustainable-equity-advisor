"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingAIButtonProps {
  onClick: () => void;
  isOpen?: boolean;
  hasSuggestions?: boolean;
}

export function FloatingAIButton({
  onClick,
  isOpen = false,
  hasSuggestions = false,
}: FloatingAIButtonProps) {
  return (
    <Button
      data-testid="floating-ai-button"
      onClick={onClick}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg transition-all duration-200",
        "hover:scale-105 hover:shadow-xl",
        isOpen && "rotate-180",
        hasSuggestions && "animate-pulse",
      )}
      aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
      aria-expanded={isOpen}
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  );
}
