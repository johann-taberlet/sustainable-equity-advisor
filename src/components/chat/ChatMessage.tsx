"use client";

import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  A2UIRenderer,
  ActionConfirmation,
  DataQueryBadge,
} from "@/components/a2ui";
import { parseA2UIMessage } from "@/lib/a2ui";
import type { ChatMessage as ChatMessageType } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import type { ActionResult } from "./Chat";

interface ChatMessageProps {
  message: ChatMessageType & {
    actionPending?: boolean;
    actionResult?: ActionResult;
    toolsUsed?: string[];
  };
  onAction?: (action: string) => void;
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === "user";
  const parsed = parseA2UIMessage(message.content);

  return (
    <div
      data-testid="chat-message"
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        data-testid={isUser ? "user-message" : "assistant-message"}
        className={cn(
          "max-w-[80%] rounded-lg px-4 py-2",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {!isUser && message.toolsUsed && message.toolsUsed.length > 0 && (
          <DataQueryBadge tools={message.toolsUsed} />
        )}
        {parsed.text && (
          <div
            className={cn(
              "prose prose-sm max-w-none",
              "prose-p:my-1 prose-p:leading-relaxed",
              "prose-ul:my-2 prose-ol:my-2",
              "prose-li:my-0.5",
              "prose-strong:font-semibold",
              "prose-headings:mb-2 prose-headings:mt-3 prose-headings:first:mt-0",
              isUser ? "prose-invert" : "dark:prose-invert",
            )}
          >
            <ReactMarkdown>{parsed.text}</ReactMarkdown>
          </div>
        )}
        {parsed.components && parsed.components.length > 0 && (
          <div className="mt-2">
            <A2UIRenderer components={parsed.components} onAction={onAction} />
          </div>
        )}
        {message.actionPending && (
          <div
            className="flex items-center gap-2 mt-2 text-sm text-muted-foreground"
            data-testid="action-pending"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating portfolio...</span>
          </div>
        )}
        {message.actionResult && (
          <ActionConfirmation {...message.actionResult} />
        )}
      </div>
    </div>
  );
}
