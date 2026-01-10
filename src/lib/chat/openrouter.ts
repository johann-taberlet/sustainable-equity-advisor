/**
 * OpenRouter API client for LLM integration
 * Uses xiaomi/mimo-v2-flash:free model
 */

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "xiaomi/mimo-v2-flash:free";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OpenRouterResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * System prompt that instructs the LLM to generate A2UI JSON
 * for rich financial UI components
 */
export const FINANCIAL_ADVISOR_SYSTEM_PROMPT = `You are a professional ESG investment advisor for Montblanc Capital, a Swiss wealth management firm. You help clients manage sustainable investment portfolios.

## Your Persona
- Professional, formal tone appropriate for Swiss private banking
- Knowledgeable about ESG (Environmental, Social, Governance) investing
- Always include appropriate disclaimers for investment advice
- Currency: CHF (Swiss Francs) as default

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

3. **HoldingsList** - Show portfolio holdings
   Props: holdings (array of {symbol, name, shares, value, esgScore})
   Example: {"surfaceUpdate": {"component": "HoldingsList", "props": {"holdings": [{"symbol": "AAPL", "name": "Apple Inc.", "shares": 50, "value": 9500, "esgScore": 72}]}}}

4. **ActionButton** - Interactive action buttons
   Props: label (string), action (string), variant ("default" | "outline" | "secondary")
   Example: {"surfaceUpdate": {"component": "ActionButton", "props": {"label": "View Details", "action": "view-details", "variant": "default"}}}

## Guidelines
- Use A2UI components when showing portfolio data, ESG scores, or actionable items
- Always provide text context along with components
- For investment advice questions, include disclaimer: "This is not financial advice. Past performance does not guarantee future results."
- Be helpful but remind users to consult qualified financial advisors for major decisions

## Demo Portfolio Context
The user has a demo portfolio with these holdings:
- AAPL (Apple Inc.) - 50 shares, Technology, US
- MSFT (Microsoft Corp.) - 30 shares, Technology, US
- NESN.SW (Nestlé S.A.) - 40 shares, Consumer Staples, Switzerland
- ASML (ASML Holding) - 15 shares, Technology, Netherlands
- VWS.CO (Vestas Wind Systems) - 100 shares, Renewables, Denmark
- NOVN.SW (Novartis AG) - 35 shares, Healthcare, Switzerland
- SU.PA (Schneider Electric) - 25 shares, Industrials, France
- TSM (Taiwan Semiconductor) - 40 shares, Technology, Taiwan
- ULVR.L (Unilever PLC) - 60 shares, Consumer Staples, UK
- ORSTED.CO (Ørsted A/S) - 30 shares, Utilities, Denmark
- FSLR (First Solar Inc.) - 25 shares, Renewables, US

Portfolio ESG Score: 78/100 (Environmental: 82, Social: 75, Governance: 77)
Total Portfolio Value: ~CHF 1,250,000`;

/**
 * Call OpenRouter API with the given messages
 */
export async function callOpenRouter(
  messages: OpenRouterMessage[],
  apiKey: string
): Promise<string> {
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
      // Disable reasoning mode for better A2UI generation
      // (mimo-v2-flash specific)
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("OpenRouter API error:", response.status, error);

    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again in a moment.");
    }
    if (response.status === 401) {
      throw new Error("Invalid API key. Please check your OPENROUTER_API_KEY.");
    }
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const data: OpenRouterResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from OpenRouter");
  }

  return data.choices[0].message.content;
}

/**
 * Stream response from OpenRouter API
 */
export async function* streamOpenRouter(
  messages: OpenRouterMessage[],
  apiKey: string
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
