"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HoldingsFilter } from "@/components/dashboard/HoldingsTablePro";
import type { NavigationSection } from "@/components/layout/Sidebar";
import { type ParsedAction, parseA2UIMessage } from "@/lib/a2ui/parser";
import { type PriceAlert, parseAlertType, saveAlert } from "@/lib/alerts";
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
    case "show_comparison":
      return `Comparing ESG scores for ${(payload.symbols as string[])?.join(" vs ")}.`;
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
  onNavigate?: (section: NavigationSection) => void;
  onFilterHoldings?: (filter: HoldingsFilter) => void;
  onAlertCreated?: (alert: PriceAlert) => void;
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
  onNavigate,
  onFilterHoldings,
  onAlertCreated,
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
        const actions = parsed.actions ?? [];
        if (actions.length > 0 && !parsed.text?.trim()) {
          const actionTexts = actions.map(generateActionText);
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

        // Execute navigate actions immediately
        const navigateActions = (parsed.actions ?? []).filter(
          (a) => a.type === "navigate",
        );
        for (const action of navigateActions) {
          const payload = action.payload as { section?: NavigationSection };
          if (payload.section && onNavigate) {
            onNavigate(payload.section);
          }
        }

        // Execute filter_holdings actions
        const filterActions = (parsed.actions ?? []).filter(
          (a) => a.type === "filter_holdings",
        );
        for (const action of filterActions) {
          const payload = action.payload as {
            sector?: string;
            minEsg?: number;
            maxEsg?: number;
          };
          if (
            onFilterHoldings &&
            (payload.sector || payload.minEsg || payload.maxEsg)
          ) {
            onFilterHoldings({
              sector: payload.sector,
              minEsg: payload.minEsg,
              maxEsg: payload.maxEsg,
            });
          }
        }

        // Execute show_comparison actions - fetch ESG data and show inline chart
        const comparisonActions = (parsed.actions ?? []).filter(
          (a) => a.type === "show_comparison",
        );
        for (const action of comparisonActions) {
          const payload = action.payload as { symbols?: string[] };
          if (payload.symbols && payload.symbols.length >= 2) {
            try {
              // Fetch ESG data for the symbols
              const response = await fetch(
                `/api/esg?symbols=${encodeURIComponent(payload.symbols.join(","))}`,
              );
              if (response.ok) {
                const result = await response.json();
                const companies = payload.symbols
                  .map((symbol) => {
                    const esgData = result.data[symbol];
                    if (esgData) {
                      return {
                        symbol: esgData.symbol,
                        name: esgData.companyName || symbol,
                        esgScore: esgData.esgScore || 0,
                        environmental: esgData.environmentalScore,
                        social: esgData.socialScore,
                        governance: esgData.governanceScore,
                      };
                    }
                    // Include even if no ESG data found
                    return {
                      symbol,
                      name: symbol,
                      esgScore: 0,
                    };
                  })
                  .filter((c) => c.esgScore > 0);

                if (companies.length >= 2) {
                  // Create synthetic message with comparison chart
                  const comparisonMessage: ExtendedChatMessage = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: `Here's the ESG comparison:\n{"surfaceUpdate": {"component": "ESGComparisonChart", "props": {"companies": ${JSON.stringify(companies)}}}}`,
                    timestamp: new Date(),
                  };
                  setMessages((prev) => [...prev, comparisonMessage]);
                }
              }
            } catch (error) {
              console.error("Error fetching comparison data:", error);
            }
          }
        }

        // Execute create_alert actions
        const alertActions = (parsed.actions ?? []).filter(
          (a) => a.type === "create_alert",
        );
        for (const action of alertActions) {
          const payload = action.payload as {
            symbol?: string;
            alertType?: string;
            value?: number;
          };
          if (payload.symbol && payload.alertType && payload.value) {
            const operator = parseAlertType(payload.alertType);
            if (operator) {
              const alert = saveAlert({
                symbol: payload.symbol.toUpperCase(),
                operator,
                targetPrice: payload.value,
                status: "active",
              });
              onAlertCreated?.(alert);
            }
          }
        }

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
      onNavigate,
      onFilterHoldings,
      onAlertCreated,
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
