"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { getMockResponse, type ChatMessage as ChatMessageType } from "@/lib/chat";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatProps {
  onPortfolioUpdate?: (data: unknown) => void;
}

export function Chat({ onPortfolioUpdate }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
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

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const response = getMockResponse(content);
    const assistantMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsLoading(false);

    // Check if the message updates portfolio
    if (/add.*shares|portfolio/i.test(content)) {
      onPortfolioUpdate?.({ updated: true });
    }
  }, [onPortfolioUpdate]);

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
            <div className="flex justify-start">
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
