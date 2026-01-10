"use client";

import { cn } from "@/lib/utils";
import { parseA2UIMessage } from "@/lib/a2ui";
import { A2UIRenderer } from "@/components/a2ui";
import type { ChatMessage as ChatMessageType } from "@/lib/chat/types";

interface ChatMessageProps {
  message: ChatMessageType;
  onAction?: (action: string) => void;
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === "user";
  const parsed = parseA2UIMessage(message.content);

  return (
    <div
      data-testid="chat-message"
      className={cn(
        "flex w-full",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        data-testid={isUser ? "user-message" : "assistant-message"}
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {parsed.text && (
          <p className="whitespace-pre-wrap">{parsed.text}</p>
        )}
        {parsed.components && parsed.components.length > 0 && (
          <div className="mt-2">
            <A2UIRenderer components={parsed.components} onAction={onAction} />
          </div>
        )}
      </div>
    </div>
  );
}
