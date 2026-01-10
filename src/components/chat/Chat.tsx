"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { ChatMessage as ChatMessageType } from "@/lib/chat";
import { ScrollArea } from "@/components/ui/scroll-area";

const MAX_MESSAGES_PER_SESSION = 20;
const QUOTA_STORAGE_KEY = "chat_quota";

interface ChatProps {
  onPortfolioUpdate?: (data?: { symbol?: string; action?: string }) => void;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// Get remaining quota from localStorage
function getQuotaFromStorage(): number {
  if (typeof window === "undefined") return MAX_MESSAGES_PER_SESSION;
  const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
  if (!stored) return MAX_MESSAGES_PER_SESSION;
  const data = JSON.parse(stored);
  // Reset quota if it's a new day
  const today = new Date().toDateString();
  if (data.date !== today) return MAX_MESSAGES_PER_SESSION;
  return data.remaining;
}

// Save quota to localStorage
function saveQuotaToStorage(remaining: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    QUOTA_STORAGE_KEY,
    JSON.stringify({
      remaining,
      date: new Date().toDateString(),
    })
  );
}

export function Chat({ onPortfolioUpdate }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messagesRemaining, setMessagesRemaining] = useState(MAX_MESSAGES_PER_SESSION);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load quota from storage on mount
  useEffect(() => {
    setMessagesRemaining(getQuotaFromStorage());
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async (content: string) => {
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the API route
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          history: conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Update conversation history for context
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content },
        { role: "assistant", content: data.message },
      ]);

      // Decrement quota
      const newQuota = messagesRemaining - 1;
      setMessagesRemaining(newQuota);
      saveQuotaToStorage(newQuota);

      // Check if the message updates portfolio
      if (/add.*(?:googl|google|alphabet)/i.test(content)) {
        onPortfolioUpdate?.({ symbol: "GOOGL", action: "add-googl" });
      } else if (/remove.*(?:aapl|apple)/i.test(content)) {
        onPortfolioUpdate?.({ action: "remove-aapl" });
      } else if (/add.*shares|portfolio/i.test(content)) {
        onPortfolioUpdate?.({});
      }
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationHistory, onPortfolioUpdate]);

  const handleAction = useCallback((action: string) => {
    // Handle A2UI button actions by sending a follow-up message
    let actionMessage = "";
    switch (action) {
      case "rebalance":
        actionMessage = "Rebalance my portfolio";
        break;
      case "esg-report":
        actionMessage = "Show me my ESG report";
        break;
      case "add-holding":
        actionMessage = "I want to add a new holding";
        break;
      default:
        actionMessage = `Perform action: ${action}`;
    }
    handleSend(actionMessage);
  }, [handleSend]);

  const isLowQuota = messagesRemaining <= 5;

  return (
    <div className="flex h-full flex-col">
      {/* Quota Indicator */}
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-b bg-muted/50">
        <span
          data-testid="quota"
          className={`text-sm ${isLowQuota ? "text-orange-600 dark:text-orange-400 font-medium" : "text-muted-foreground"}`}
          aria-label={`${messagesRemaining} messages remaining`}
        >
          {messagesRemaining} messages remaining
        </span>
        {isLowQuota && (
          <span
            data-testid="quota-warning"
            className="text-xs text-orange-600 dark:text-orange-400"
            aria-label="Low quota warning"
          >
            (Low)
          </span>
        )}
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onAction={handleAction}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start" data-testid="loading" aria-busy="true">
              <div className="rounded-lg bg-muted px-4 py-2">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
