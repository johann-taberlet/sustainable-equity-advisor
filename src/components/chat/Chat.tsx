"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type ParsedAction, parseA2UIMessage } from "@/lib/a2ui/parser";
import type { ChatMessage as ChatMessageType } from "@/lib/chat";
import { useCurrency } from "@/lib/currency";
import { ChatInput, type ChatInputHandle } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";

// Generate fallback message text when AI only returns action JSON
function generateActionText(action: ParsedAction): string {
  const payload = action.payload as Record<string, unknown>;
  switch (action.type) {
    case "add_holding":
      return `Adding ${payload.shares || 1} shares of ${payload.symbol} to your portfolio.`;
    case "remove_holding":
      return `Removing ${payload.symbol} from your portfolio.`;
    case "update_holding":
      return `Updating ${payload.symbol} to ${payload.shares} shares.`;
    case "create_alert":
      return `Alert created for ${payload.symbol}: ${payload.alertType} at ${payload.value}.`;
    case "filter_holdings":
      return `Filtering holdings${payload.sector ? ` by ${payload.sector}` : ""}${payload.minEsg ? ` with ESG ≥ ${payload.minEsg}` : ""}.`;
    case "navigate":
      return `Navigating to ${payload.section}.`;
    case "highlight":
      return `Highlighting ${(payload.symbols as string[])?.join(", ")}.`;
    case "show_comparison":
      return `Comparing ${(payload.symbols as string[])?.join(" vs ")}.`;
    default:
      return `Action: ${action.type.replace(/_/g, " ")}`;
  }
}

export interface PortfolioAction {
  type: "add_holding" | "remove_holding" | "update_holding";
  symbol: string;
  shares?: number;
  name?: string;
}

export interface ActionResult {
  actionType: "add_holding" | "remove_holding" | "update_holding";
  symbol: string;
  shares?: number;
  name?: string;
  previousShares?: number;
  newTotal?: number;
}

interface ExtendedChatMessage extends ChatMessageType {
  actionPending?: boolean;
  actionResult?: ActionResult;
  toolsUsed?: string[];
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  shares: number;
  value: number;
  esgScore: number;
  sector: string;
}

interface ChatProps {
  onPortfolioUpdate?: (action: PortfolioAction) => void;
  getHoldingShares?: (symbol: string) => number;
  holdings?: PortfolioHolding[];
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

// Detect if a message is likely to trigger portfolio queries
function isPortfolioQuery(content: string): boolean {
  const portfolioKeywords = [
    "portfolio",
    "holdings",
    "shares",
    "stock",
    "position",
    "how many",
    "how much",
    "value",
    "nestle",
    "apple",
    "microsoft",
    "aapl",
    "msft",
    "googl",
    "nesn",
    "my stocks",
    "what do i have",
    "what do i own",
    "esg score",
  ];
  const lowerContent = content.toLowerCase();
  return portfolioKeywords.some((keyword) => lowerContent.includes(keyword));
}

export function Chat({
  onPortfolioUpdate,
  getHoldingShares,
  holdings,
}: ChatProps) {
  // Get currency from context - reactive to changes
  const { currency, exchangeRate } = useCurrency();
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Thinking...");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputHandle>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSend = useCallback(
    async (content: string) => {
      const userMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Show appropriate loading message based on query type
      if (isPortfolioQuery(content)) {
        setLoadingMessage("Querying your data...");
      } else {
        setLoadingMessage("Thinking...");
      }

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
            holdings: holdings,
            currency: currency,
            exchangeRate: exchangeRate,
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        // Parse AI response to extract actions
        const parsed = parseA2UIMessage(data.message);
        // Only show pending spinner for portfolio-modifying actions
        const portfolioActionTypes = [
          "add_holding",
          "remove_holding",
          "update_holding",
        ];
        const hasPortfolioActions =
          parsed.actions?.some((a) => portfolioActionTypes.includes(a.type)) ||
          false;

        // Generate fallback text if AI only returned JSON without text
        let displayContent = data.message;
        const hasAnyActions = parsed.actions && parsed.actions.length > 0;
        if (hasAnyActions && !parsed.text?.trim()) {
          const actionTexts = parsed.actions?.map(generateActionText);
          displayContent = `${actionTexts.join("\n")}\n${data.message}`;
        }

        const messageId = crypto.randomUUID();
        const assistantMessage: ExtendedChatMessage = {
          id: messageId,
          role: "assistant",
          content: displayContent,
          timestamp: new Date(),
          actionPending: hasPortfolioActions,
          toolsUsed: data.toolsUsed || [],
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
        // Focus input after response
        setTimeout(() => inputRef.current?.focus(), 100);

        // Update conversation history for context
        setConversationHistory((prev) => [
          ...prev,
          { role: "user", content },
          { role: "assistant", content: data.message },
        ]);

        // Execute portfolio actions from the AI response
        if (hasPortfolioActions) {
          // Small delay to show the spinner
          await new Promise((resolve) => setTimeout(resolve, 500));

          const portfolioActions = (parsed.actions ?? []).filter((a) =>
            portfolioActionTypes.includes(a.type),
          );
          for (const action of portfolioActions) {
            let actionResult: ActionResult | undefined;

            if (action.type === "add_holding") {
              const payload = action.payload as {
                symbol?: string;
                shares?: number;
                name?: string;
              };
              if (payload.symbol) {
                const previousShares = getHoldingShares?.(payload.symbol) || 0;
                onPortfolioUpdate?.({
                  type: "add_holding",
                  symbol: payload.symbol,
                  shares: payload.shares || 1,
                  name: payload.name,
                });
                actionResult = {
                  actionType: "add_holding",
                  symbol: payload.symbol,
                  shares: payload.shares || 1,
                  name: payload.name,
                  previousShares,
                  newTotal: previousShares + (payload.shares || 1),
                };
              }
            } else if (action.type === "remove_holding") {
              const payload = action.payload as { symbol?: string };
              if (payload.symbol) {
                onPortfolioUpdate?.({
                  type: "remove_holding",
                  symbol: payload.symbol,
                });
                actionResult = {
                  actionType: "remove_holding",
                  symbol: payload.symbol,
                };
              }
            } else if (action.type === "update_holding") {
              const payload = action.payload as {
                symbol?: string;
                shares?: number;
              };
              if (payload.symbol) {
                onPortfolioUpdate?.({
                  type: "update_holding",
                  symbol: payload.symbol,
                  shares: payload.shares,
                });
                actionResult = {
                  actionType: "update_holding",
                  symbol: payload.symbol,
                  shares: payload.shares,
                };
              }
            }

            // Update message with action result
            if (actionResult) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === messageId
                    ? { ...msg, actionPending: false, actionResult }
                    : msg,
                ),
              );
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error);

        const errorMessage: ExtendedChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "I apologize, but I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        // Focus input after error
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [
      conversationHistory,
      onPortfolioUpdate,
      getHoldingShares,
      holdings,
      currency,
      exchangeRate,
    ],
  );

  const handleAction = useCallback(
    (action: string) => {
      // Handle A2UI button actions by sending a follow-up message
      let actionMessage = "";
      switch (action) {
        case "view-portfolio":
          actionMessage = "Show me my portfolio";
          break;
        case "view-holdings":
          actionMessage = "List all my holdings";
          break;
        case "add-holding":
          actionMessage = "I want to add a new holding";
          break;
        case "remove-holding":
          actionMessage = "I want to remove a holding";
          break;
        case "research-stocks":
          actionMessage = "I want to research a stock";
          break;
        case "esg-report":
        case "view-esg":
          actionMessage = "Show me my ESG breakdown";
          break;
        case "filter-holdings":
          actionMessage = "Filter my holdings by ESG score";
          break;
        case "set-alert":
          actionMessage = "I want to set up a price alert";
          break;
        case "compare-holdings":
          actionMessage = "Compare my holdings";
          break;
        case "rebalance":
          actionMessage = "Rebalance my portfolio";
          break;
        default:
          // Handle dynamic actions like "research-AAPL"
          if (action.startsWith("research-")) {
            const symbol = action.replace("research-", "");
            actionMessage = `Tell me about ${symbol} stock`;
          } else if (action.startsWith("add-")) {
            const symbol = action.replace("add-", "");
            actionMessage = `Add ${symbol} to my portfolio`;
          } else {
            actionMessage = `${action.replace(/-/g, " ")}`;
          }
      }
      handleSend(actionMessage);
    },
    [handleSend],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onAction={handleAction}
            />
          ))}
          {isLoading && (
            <div
              className="flex justify-start"
              data-testid="loading"
              aria-busy="true"
            >
              <div className="rounded-lg bg-muted px-4 py-2">
                <span className="animate-pulse">{loadingMessage}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="border-t p-4">
        <ChatInput ref={inputRef} onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
