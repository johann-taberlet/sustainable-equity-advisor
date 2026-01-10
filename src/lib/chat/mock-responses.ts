/**
 * Mock responses for testing A2UI rendering
 * In production, these would come from the LLM via OpenRouter
 */

interface MockResponse {
  pattern: RegExp;
  response: string;
}

const mockResponses: MockResponse[] = [
  // ESG breakdown for specific stocks
  {
    pattern: /esg.*breakdown.*(?:for\s+)?(microsoft|msft)/i,
    response: `Here's the ESG breakdown for Microsoft (MSFT):

**Microsoft Corporation ESG Analysis**

| Category | Score |
|----------|-------|
| **Overall ESG Score** | 85/100 |
| **Environmental** | 82/100 |
| **Social** | 88/100 |
| **Governance** | 85/100 |

Microsoft demonstrates strong performance across all ESG categories, with particularly high scores in Social responsibility due to their employee programs and community initiatives.`,
  },
  // Unknown/fake stock symbols
  {
    pattern: /esg.*(?:score|breakdown).*(?:for\s+)?(?:xyzfake|unknown|invalid)/i,
    response: `I couldn't find ESG data for that symbol. The requested stock symbol is not available in our database. ESG data is not available or N/A for this security. Please check the symbol and try again, or search for a different stock.`,
  },
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
  {
    pattern: /what.*(stock|share).*buy|buy.*(stock|share)/i,
    response: `I understand you're looking for investment opportunities. When considering stocks, it's important to evaluate factors such as ESG performance, financial fundamentals, and alignment with your investment goals.

Please note: This is not financial advice. Past performance does not guarantee future results. I recommend consulting with a qualified financial advisor before making any investment decisions. Consider your own risk tolerance and conduct due diligence on any investment.`,
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
