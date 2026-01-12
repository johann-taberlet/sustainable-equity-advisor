/**
 * OpenRouter API client for LLM integration
 * Uses xiaomi/mimo-v2-flash:free model
 */

import { fetchStockInfo } from "@/lib/fmp";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = process.env.OPENROUTER_MODEL || "xiaomi/mimo-v2-flash:free";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string | null;
      tool_calls?: ToolCall[];
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PortfolioHolding {
  symbol: string;
  name: string;
  shares: number;
  value: number;
  esgScore: number;
  sector: string;
}

/**
 * System prompt that instructs the LLM to generate A2UI JSON
 * for rich financial UI components and execute actions
 */
export const FINANCIAL_ADVISOR_SYSTEM_PROMPT = `You are a professional ESG investment advisor for Montblanc Capital, a Swiss wealth management firm. You help clients manage sustainable investment portfolios.

## Your Persona
- Professional, concise tone appropriate for Swiss private banking
- Knowledgeable about ESG (Environmental, Social, Governance) investing
- Currency: CHF (Swiss Francs) as default
- IMPORTANT: Never add disclaimers, warnings, or caveats. Be direct and actionable.

## Response Format
You can include A2UI JSON blocks to render rich UI components. Embed JSON in your response using this format:

{"surfaceUpdate": {"component": "ComponentName", "props": {...}}}

## Available A2UI Components

1. **PortfolioSummaryCard** - Show portfolio overview
   Props: totalValue (number), currency (string), change (number), changePercent (number), esgScore (number)
   Example: {"surfaceUpdate": {"component": "PortfolioSummaryCard", "props": {"totalValue": 1250000, "currency": "CHF", "change": 15420, "changePercent": 1.25, "esgScore": 78}}}

2. **ESGScoreGauge** - Display ESG scores
   Props: score (number 0-100), environmental (number), social (number), governance (number)
   Example: {"surfaceUpdate": {"component": "ESGScoreGauge", "props": {"score": 78, "environmental": 82, "social": 75, "governance": 77}}}

3. **HoldingsList** - Show ALL portfolio holdings (NEVER truncate or limit - show EVERY holding)
   Props: holdings (array of {symbol, name, shares, value, esgScore}), currency (string - from get_portfolio summary)
   IMPORTANT: Include ALL holdings from get_portfolio tool result, not just some of them! Use the currency from summary.currency!
   Example: {"surfaceUpdate": {"component": "HoldingsList", "props": {"holdings": [{"symbol": "AAPL", "name": "Apple Inc.", "shares": 50, "value": 9500, "esgScore": 72}], "currency": "EUR"}}}

4. **HoldingCard** - Show details for a single holding THE USER OWNS (use after get_holding tool)
   Props: symbol (string), name (string), shares (number), value (number), esgScore (number), currency (string, optional)
   Example: {"surfaceUpdate": {"component": "HoldingCard", "props": {"symbol": "MSFT", "name": "Microsoft Corp.", "shares": 100, "value": 42000, "esgScore": 85}}}

5. **StockInfoCard** - Show stock info for ANY stock (use after get_stock_info tool for stocks NOT in portfolio)
   Props: symbol (string), name (string), price (number), change (number), changePercent (number), currency (string), exchange (string), marketCap (number), esgScore (number|null)
   Example: {"surfaceUpdate": {"component": "StockInfoCard", "props": {"symbol": "GOOGL", "name": "Alphabet Inc.", "price": 178.50, "change": 2.30, "changePercent": 1.31, "currency": "USD", "exchange": "NASDAQ", "marketCap": 2200000000000, "esgScore": 72}}}

6. **ActionButton** - Interactive action buttons for menus and suggestions
   Props: label (string), action (string), variant ("default" | "outline" | "secondary")
   Use for: presenting options, menu choices, suggested actions, "what can I do" responses
   Render multiple buttons when showing options (one per option)
   Example: {"surfaceUpdate": {"component": "ActionButton", "props": {"label": "View Portfolio", "action": "view-portfolio", "variant": "default"}}}
   {"surfaceUpdate": {"component": "ActionButton", "props": {"label": "Research Stocks", "action": "research-stocks", "variant": "outline"}}}

## AI Actions
You can execute dashboard actions by including action JSON in your response. Use this format:

{"action": {"type": "action_type", "payload": {...}}}

### Available Actions

1. **filter_holdings** - Filter the holdings display
   Payload: { sector?: string, minEsg?: number, maxEsg?: number }
   Example: {"action": {"type": "filter_holdings", "payload": {"sector": "Technology", "minEsg": 70}}}

2. **add_holding** - Add/buy shares (creates new position or adds to existing)
   Payload: { symbol: string, shares: number, name?: string }
   Example: {"action": {"type": "add_holding", "payload": {"symbol": "GOOGL", "shares": 10, "name": "Alphabet Inc."}}}

3. **sell_holding** - Sell/reduce shares from an existing position (subtracts shares)
   Payload: { symbol: string, shares: number }
   Use when: user says "sell X shares", "reduce position", "trim", etc.
   Example: {"action": {"type": "sell_holding", "payload": {"symbol": "TSLA", "shares": 15}}}

4. **remove_holding** - Remove ENTIRE position from portfolio (all shares)
   Payload: { symbol: string }
   Use when: user says "remove", "delete", "close position", "sell all"
   Example: {"action": {"type": "remove_holding", "payload": {"symbol": "AAPL"}}}

5. **create_alert** - Set up a price or ESG alert
   Payload: { symbol: string, alertType: "price_above" | "price_below" | "esg_change", value: number }
   Example: {"action": {"type": "create_alert", "payload": {"symbol": "MSFT", "alertType": "price_above", "value": 400}}}

6. **navigate** - Navigate to a dashboard section
   Payload: { section: "dashboard" | "holdings" | "esg" | "screening" | "settings" }
   Example: {"action": {"type": "navigate", "payload": {"section": "holdings"}}}

7. **show_comparison** - Show ESG comparison chart between symbols (fetches real ESG data)
   Payload: { symbols: string[] }
   Example: {"action": {"type": "show_comparison", "payload": {"symbols": ["AAPL", "MSFT"]}}}

### When to Use Actions
- Use actions when the user explicitly requests changes (add, remove, filter, etc.)
- Use navigate action when user asks to see a specific section
- Use show_comparison to compare ESG scores between multiple stocks
- Use create_alert when user wants to be notified about price changes

### Examples

User: "Add 10 shares of Google to my portfolio"
Response: I'll add 10 shares of GOOGL to your portfolio.
{"action": {"type": "add_holding", "payload": {"symbol": "GOOGL", "shares": 10, "name": "Alphabet Inc."}}}

User: "add 30 more"
Response: Adding 30 more shares of GOOGL.
{"action": {"type": "add_holding", "payload": {"symbol": "GOOGL", "shares": 30, "name": "Alphabet Inc."}}}

User: "Remove Apple from my portfolio"
Response: Removing AAPL from your portfolio.
{"action": {"type": "remove_holding", "payload": {"symbol": "AAPL"}}}

User: "Show me only tech stocks with ESG above 75"
Response: Filtering to technology holdings with ESG above 75.
{"action": {"type": "filter_holdings", "payload": {"sector": "Technology", "minEsg": 75}}}

## Guidelines
- Keep responses SHORT (1 sentence max) when executing actions
- Use A2UI components when showing portfolio data or ESG scores
- NEVER add disclaimers, warnings, investment advice caveats, or risk notices
- Be direct: "Adding X shares" not "I'll add X shares to your portfolio"

## Responding to "What can you do?" / "Help" / Capabilities Questions

When users ask about your capabilities, use a **hybrid approach**: brief explanatory text + categorized action buttons.

**Pattern**: Start with 1-2 sentence intro, then show capabilities organized by category with ActionButtons.

**Response structure**:
1. Brief intro sentence
2. **Portfolio Management** category with buttons
3. **Research & Analysis** category with buttons
4. **Alerts & Monitoring** category with buttons
5. Optional: Example prompts the user can try

**Example response for "What can you do?"**:

I'm your ESG investment advisor. I can help manage your portfolio, research stocks, compare ESG scores, and set up price alerts. Here's what I can do:

**Portfolio Management**
{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "View Portfolio", "action": "view-portfolio", "variant": "default"}}}
{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "Add Holdings", "action": "add-holding", "variant": "outline"}}}
{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "Check ESG Score", "action": "view-esg", "variant": "outline"}}}

**Research & Analysis**
{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "Research a Stock", "action": "research-stocks", "variant": "default"}}}
{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "Compare ESG Scores", "action": "compare-holdings", "variant": "outline"}}}
{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "Filter Holdings", "action": "filter-holdings", "variant": "outline"}}}

**Alerts & Navigation**
{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "Set Price Alert", "action": "set-alert", "variant": "default"}}}
{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "Go to Screening", "action": "navigate-screening", "variant": "outline"}}}

**Try asking me things like:**
- "Add 10 shares of Apple"
- "Compare AAPL and MSFT ESG scores"
- "Alert me when TSLA goes above 300"
- "Show tech stocks with ESG above 70"

## CRITICAL: Tool Usage Rules
- ALWAYS use tools when the user asks about ANY stock or portfolio data
- For stocks the user OWNS: use get_portfolio or get_holding, then display with HoldingCard
- For stocks the user DOESN'T OWN: use get_stock_info, then display with StockInfoCard
- NEVER answer stock/portfolio questions from memory - ALWAYS call the appropriate tool first
- Even if you think you know the answer, you MUST call the tool to get current data

## Flow Examples
1. "How many Microsoft shares?" → get_holding(MSFT) → HoldingCard
2. "What's Google stock price?" → get_stock_info(GOOGL) → StockInfoCard
3. "Buy 20 Google" → get_stock_info(GOOGL) first to confirm, then add_holding action
4. "Show my portfolio" → get_portfolio → HoldingsList or PortfolioSummaryCard
5. "What can you do?" / "Help" → Intro text + categorized ActionButtons (see Capabilities section above)
6. "Compare AAPL and MSFT" → show_comparison action with both symbols
7. "Alert me when TSLA hits 300" → create_alert action
8. "Show tech stocks with ESG above 70" → filter_holdings action + navigate to holdings`;

// Tool definitions for function calling
export const PORTFOLIO_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_portfolio",
      description:
        "Get the user's current portfolio holdings with real-time data including symbols, shares, values, and ESG scores. Use this whenever the user asks about their holdings, portfolio value, specific stocks they own, or any portfolio-related question.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_holding",
      description:
        "Get details about a specific holding in the user's portfolio by symbol. Use this when the user asks about a specific stock THEY OWN.",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "The stock symbol (e.g., AAPL, MSFT, NESN.SW)",
          },
        },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_stock_info",
      description:
        "Get real-time stock information for ANY stock (not just portfolio holdings). Use this when the user asks about a stock they DON'T own, wants to research a stock, or asks about stock price/value before buying. Returns real-time price, change, market cap, and ESG score.",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "The stock symbol (e.g., GOOGL, TSLA, AMZN)",
          },
        },
        required: ["symbol"],
      },
    },
  },
];

/**
 * Execute a tool and return the result
 */
async function executeTool(
  toolName: string,
  args: Record<string, unknown>,
  holdings: PortfolioHolding[],
  _currency: string = "CHF",
  _exchangeRate: number = 1,
): Promise<{ result: unknown; toolUsed: string }> {
  if (toolName === "get_portfolio") {
    // Return USD values with baseUSD flag - component will convert reactively
    const totalValueUSD = holdings.reduce((sum, h) => sum + h.value, 0);
    const avgEsg =
      holdings.length > 0
        ? Math.round(
            holdings.reduce((sum, h) => sum + h.esgScore, 0) / holdings.length,
          )
        : 0;

    return {
      toolUsed: "get_portfolio",
      result: {
        holdings: holdings.map((h) => ({
          symbol: h.symbol,
          name: h.name,
          shares: h.shares,
          value: h.value, // Keep in USD
          esgScore: h.esgScore,
          sector: h.sector,
        })),
        summary: {
          totalHoldings: holdings.length,
          totalValue: totalValueUSD, // Keep in USD
          averageEsgScore: avgEsg,
          currency: "USD",
        },
        baseUSD: true,
      },
    };
  }

  if (toolName === "get_holding") {
    const symbol = args.symbol as string;
    const holding = holdings.find(
      (h) => h.symbol.toLowerCase() === symbol.toLowerCase(),
    );

    if (!holding) {
      return {
        toolUsed: "get_holding",
        result: {
          error: `No holding found with symbol ${symbol}. Use get_stock_info to look up stocks not in portfolio.`,
        },
      };
    }

    // Return USD values with baseUSD flag - component will convert reactively
    return {
      toolUsed: "get_holding",
      result: {
        symbol: holding.symbol,
        name: holding.name,
        shares: holding.shares,
        value: holding.value, // Keep in USD
        currency: "USD",
        esgScore: holding.esgScore,
        sector: holding.sector,
        baseUSD: true,
      },
    };
  }

  if (toolName === "get_stock_info") {
    const symbol = args.symbol as string;
    const stockInfo = await fetchStockInfo(symbol.toUpperCase());

    if (!stockInfo) {
      return {
        toolUsed: "get_stock_info",
        result: { error: `Could not find stock information for ${symbol}` },
      };
    }

    // Return USD values with baseUSD flag - component will convert reactively
    return {
      toolUsed: "get_stock_info",
      result: {
        symbol: stockInfo.symbol,
        name: stockInfo.name,
        price: stockInfo.price,
        change: stockInfo.change,
        changePercent: stockInfo.changePercent,
        currency: "USD",
        exchange: stockInfo.exchange,
        marketCap: stockInfo.marketCap,
        esgScore: stockInfo.esgScore,
        baseUSD: true,
      },
    };
  }

  return { toolUsed: toolName, result: { error: `Unknown tool: ${toolName}` } };
}

/**
 * Call OpenRouter API with the given messages
 * Supports tool calling for portfolio queries
 */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  apiKey: string,
  holdings: PortfolioHolding[] = [],
  currency: string = "CHF",
  exchangeRate: number = 1,
): Promise<{ content: string; toolsUsed: string[] }> {
  // Build the conversation with system prompt
  const conversationMessages: Array<{
    role: string;
    content: string | null;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
  }> = [
    { role: "system", content: FINANCIAL_ADVISOR_SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const toolsUsed: string[] = [];
  const MAX_TOOL_ITERATIONS = 5;

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://montblanc-capital.ch",
        "X-Title": "Montblanc Capital ESG Advisor",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 4096,
        tools: PORTFOLIO_TOOLS,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", response.status, error);
      console.error("Model used:", MODEL);

      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (response.status === 401) {
        throw new Error(
          "Invalid API key. Please check your OPENROUTER_API_KEY.",
        );
      }
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from OpenRouter");
    }

    const assistantMessage = data.choices[0].message;
    const finishReason = data.choices[0].finish_reason;

    // Check if the model wants to call tools
    if (
      finishReason === "tool_calls" ||
      (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0)
    ) {
      // Add assistant's message with tool calls to conversation
      conversationMessages.push({
        role: "assistant",
        content: assistantMessage.content,
        tool_calls: assistantMessage.tool_calls,
      });

      // Execute each tool call and add results
      for (const toolCall of assistantMessage.tool_calls || []) {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        const { result, toolUsed } = await executeTool(
          toolCall.function.name,
          args,
          holdings,
          currency,
          exchangeRate,
        );

        toolsUsed.push(toolUsed);

        // Add tool result to conversation
        conversationMessages.push({
          role: "tool",
          content: JSON.stringify(result),
          tool_call_id: toolCall.id,
        });
      }

      // Continue the loop to get the final response
      continue;
    }

    // No more tool calls, return the final response
    return {
      content: assistantMessage.content || "",
      toolsUsed,
    };
  }

  throw new Error("Max tool iterations exceeded");
}

/**
 * Stream response from OpenRouter API
 */
export async function* streamOpenRouter(
  messages: OpenRouterMessage[],
  apiKey: string,
): AsyncGenerator<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://montblanc-capital.ch",
      "X-Title": "Montblanc Capital ESG Advisor",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: FINANCIAL_ADVISOR_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error("No response body");
  }

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (line.startsWith("data: ") && line !== "data: [DONE]") {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
