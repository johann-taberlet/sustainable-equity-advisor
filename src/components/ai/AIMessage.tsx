"use client";

import { cn } from "@/lib/utils";
import { parseA2UIMessage } from "@/lib/a2ui";
import { A2UIRenderer } from "@/components/a2ui";
import type { ChatMessage } from "@/lib/chat/types";

interface AIMessageProps {
  message: ChatMessage;
  onAction?: (action: string) => void;
  showTimestamp?: boolean;
}

export function AIMessage({
  message,
  onAction,
  showTimestamp = false,
}: AIMessageProps) {
  const isUser = message.role === "user";
  const parsed = parseA2UIMessage(message.content);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      data-testid="ai-message"
      className={cn(
        "flex w-full gap-2",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        data-testid={isUser ? "user-message" : "assistant-message"}
        className={cn(
          "max-w-[85%] rounded-lg px-3 py-2",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {parsed.text && (
          <p className="whitespace-pre-wrap text-sm">{parsed.text}</p>
        )}
        {parsed.components && parsed.components.length > 0 && (
          <div className="mt-2" data-testid="a2ui-component">
            <A2UIRenderer components={parsed.components} onAction={onAction} />
          </div>
        )}
        {showTimestamp && message.timestamp && (
          <span
            className={cn(
              "mt-1 block text-xs opacity-60",
              isUser ? "text-right" : "text-left",
            )}
          >
            {formatTime(message.timestamp)}
          </span>
        )}
      </div>
    </div>
  );
}
