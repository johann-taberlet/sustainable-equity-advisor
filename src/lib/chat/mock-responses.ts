/**
 * Mock responses for testing A2UI rendering
 * In production, these would come from the LLM via OpenRouter
 */

interface MockResponse {
  pattern: RegExp;
  response: string;
}

const mockResponses: MockResponse[] = [
  {
    pattern: /esg\s*score/i,
    response: `Here's your portfolio ESG score:

{"surfaceUpdate": {"component": "ESGScoreGauge", "props": {"score": 78, "environmental": 82, "social": 75, "governance": 77}}}`,
  },
  {
    pattern: /portfolio\s*(summary|value)?/i,
    response: `Here's your portfolio summary:

{"surfaceUpdate": {"component": "PortfolioSummaryCard", "props": {"totalValue": 1250000, "currency": "CHF", "change": 15420, "changePercent": 1.25, "esgScore": 78}}}`,
  },
  {
    pattern: /holdings|list.*holdings/i,
    response: `Here are your current holdings:

{"surfaceUpdate": {"component": "HoldingsList", "props": {"holdings": [{"symbol": "AAPL", "name": "Apple Inc.", "shares": 150, "value": 28500, "esgScore": 72}, {"symbol": "MSFT", "name": "Microsoft Corp.", "shares": 100, "value": 42000, "esgScore": 85}, {"symbol": "NVDA", "name": "NVIDIA Corp.", "shares": 50, "value": 62500, "esgScore": 68}]}}}`,
  },
  {
    pattern: /actions?|what can i do|options/i,
    response: `Here are some actions you can take:

{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "Rebalance Portfolio", "action": "rebalance", "variant": "default"}}}
{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "View ESG Report", "action": "esg-report", "variant": "outline"}}}
{"surfaceUpdate": {"component": "ActionButton", "props": {"label": "Add New Holding", "action": "add-holding", "variant": "secondary"}}}`,
  },
  {
    pattern: /add.*(\d+).*shares?.*of\s+(\w+)/i,
    response: `I've added the shares to your portfolio. Here's your updated portfolio:

{"surfaceUpdate": {"component": "PortfolioSummaryCard", "props": {"totalValue": 1268500, "currency": "CHF", "change": 18500, "changePercent": 1.48, "esgScore": 76}}}`,
  },
  {
    pattern: /hello|hi|hey/i,
    response: `Hello! I'm your AI ESG investment advisor. I can help you manage your sustainable portfolio, analyze ESG scores, and make informed investment decisions. What would you like to know about your portfolio today?`,
  },
];

export function getMockResponse(userMessage: string): string {
  for (const { pattern, response } of mockResponses) {
    if (pattern.test(userMessage)) {
      return response;
    }
  }

  // Default response
  return `I understand you're asking about "${userMessage}". I'm here to help you with your sustainable investment portfolio. You can ask me about your portfolio value, ESG scores, or available actions.`;
}
