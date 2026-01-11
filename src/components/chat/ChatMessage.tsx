"use client";

import ReactMarkdown from "react-markdown";
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
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                li: ({ children }) => <li className="mb-1">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                code: ({ children }) => (
                  <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                ),
              }}
            >
              {parsed.text}
            </ReactMarkdown>
          </div>
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
