"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { ChatMessage as ChatMessageType } from "@/lib/chat";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatProps {
  onPortfolioUpdate?: (data?: { symbol?: string; action?: string }) => void;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export function Chat({ onPortfolioUpdate }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="flex h-full flex-col">
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
