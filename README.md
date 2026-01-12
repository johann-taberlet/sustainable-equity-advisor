# Sustainable Equity Advisor

An AI-powered ESG investment advisory platform featuring conversational portfolio management through natural language. Built as a portfolio demo for a fictional Swiss wealth management firm.

**[Live Demo](https://sustainable-equity-advisor.vercel.app)**

## Features

### AI Chat Assistant
- Natural language portfolio management ("Add 10 shares of Apple", "Sell 5 Tesla")
- ESG stock comparisons with visual charts
- Smart filtering ("Show tech stocks with ESG above 70")
- Price alerts with localStorage persistence
- Navigation commands ("Show me the holdings")

### Portfolio Dashboard
- Real-time portfolio valuation with currency conversion (USD/EUR/CHF)
- ESG score breakdown (Environmental, Social, Governance)
- Top ESG contributors ranked by weighted contribution
- Controversy risk alerts
- Interactive holdings table with sorting and filtering

### ESG Analysis
- Per-holding ESG scoring with color-coded indicators
- Sector allocation visualization
- ESG comparison charts between multiple stocks

### Data Integration
- Real-time stock prices via Financial Modeling Prep API
- ESG scores from curated dataset
- Multi-currency support with live exchange rates

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS 4 + shadcn/ui
- **AI:** OpenRouter API (LLM integration)
- **Charts:** Recharts
- **Language:** TypeScript
- **Linting:** Biome

## Quick Start

```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Add your OPENROUTER_API_KEY and FMP_API_KEY

# Run development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENROUTER_API_KEY` | API key for LLM chat functionality |
| `FMP_API_KEY` | Financial Modeling Prep API for stock data |

## Project Structure

```
src/
├── app/                    # Next.js App Router
├── components/
│   ├── a2ui/              # A2UI protocol components (chat UI)
│   ├── chat/              # Chat interface components
│   ├── dashboard/         # Dashboard widgets
│   ├── layout/            # Layout components (Sidebar, Header)
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── alerts/            # Price alert utilities
│   ├── chat/              # LLM integration (OpenRouter)
│   └── currency/          # Currency conversion context
└── hooks/                 # Custom React hooks
```

## Architecture Highlights

- **A2UI Protocol:** LLM outputs structured JSON actions that the client executes (add holdings, navigate, filter, etc.)
- **Tool Calling:** LLM uses function calling to query portfolio data and stock information
- **Reactive Currency:** Currency conversion happens client-side via React Context for instant switching
- **Optimistic UI:** Actions show immediate feedback before confirmation

## License

MIT
