# Sustainable Equity Advisor - Implemented Features

A comprehensive documentation of all implemented features in the AI-powered ESG investment advisory platform.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Application Architecture](#application-architecture)
3. [UI/UX Overview](#uiux-overview)
4. [Core Features](#core-features)
5. [AI & Chat System](#ai--chat-system)
6. [Portfolio Management](#portfolio-management)
7. [ESG Data & Scoring](#esg-data--scoring)
8. [Stock Screening](#stock-screening)
9. [Data Visualization](#data-visualization)
10. [API Integration](#api-integration)
11. [State Management](#state-management)
12. [Testing Infrastructure](#testing-infrastructure)

---

## Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework with App Router |
| React | 19.2.3 | UI library with React Compiler |
| TypeScript | 5.x | Type-safe development |
| Bun | Latest | Package manager & runtime |

### Styling & UI
| Technology | Version | Purpose |
|------------|---------|---------|
| Tailwind CSS | 4.x | Utility-first CSS framework |
| shadcn/ui | Latest | 53 pre-installed UI components |
| Lucide React | 0.562.0 | Icon library |
| next-themes | 0.4.6 | Dark/light mode theming |
| class-variance-authority | 0.7.1 | Component variants |
| tailwind-merge | 3.4.0 | Class merging utility |

### Data Visualization
| Technology | Version | Purpose |
|------------|---------|---------|
| Recharts | 2.15.4 | Charts (Pie, Line, Bar) |
| Progress bars | Custom | ESG score visualization |

### Backend & Data
| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | 2.90.1 | PostgreSQL database & auth |
| OpenRouter API | - | LLM (xiaomi/mimo-v2-flash:free) |
| Financial Modeling Prep | - | Real stock & ESG data |

### Forms & Validation
| Technology | Version | Purpose |
|------------|---------|---------|
| React Hook Form | 7.70.0 | Form handling |
| Zod | 4.3.5 | Schema validation |

### Development Tools
| Technology | Version | Purpose |
|------------|---------|---------|
| Biome | 2.2.0 | Linter & formatter |
| Playwright | 1.57.0 | E2E testing |
| babel-plugin-react-compiler | 1.0.0 | React optimization |

### Typography
- **Geist Sans** - Primary sans-serif font
- **Geist Mono** - Monospace font
- **JetBrains Mono** - Financial data (tabular numbers)

---

## Application Architecture

### Directory Structure
```
src/
├── app/                     # Next.js App Router
│   ├── api/                # 3 API routes
│   │   ├── chat/          # AI chat endpoint
│   │   ├── esg/           # ESG data endpoint
│   │   └── stock/         # Stock quote endpoint
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main application
│   └── globals.css        # Tailwind + custom styles
│
├── components/             # React components (81 files)
│   ├── ui/                # 53 shadcn/ui components
│   ├── a2ui/              # 8 A2UI components
│   ├── ai/                # AI panel components
│   ├── chat/              # Chat interface
│   ├── dashboard/         # Dashboard widgets
│   └── layout/            # Layout components
│
├── lib/                    # Business logic
│   ├── a2ui/              # A2UI parser & types
│   ├── ai/                # AI action handlers
│   ├── chat/              # OpenRouter client
│   ├── fmp/               # FMP API client
│   ├── portfolio/         # Portfolio calculations
│   └── supabase/          # Database queries
│
└── hooks/                  # Custom React hooks
    ├── useAIActions.ts    # AI action management
    └── use-mobile.ts      # Responsive detection
```

---

## UI/UX Overview

### Layout Structure
The application uses a **3-panel responsive layout**:

```
┌─────────────────────────────────────────────────────────────┐
│                        HEADER (h-14)                        │
│  [Portfolio Dropdown]              [Theme Toggle] [User ▾]  │
├────────────┬────────────────────────────────┬───────────────┤
│            │                                │               │
│  SIDEBAR   │       MAIN CONTENT AREA        │   AI PANEL    │
│  (w-64)    │                                │   (w-[400px]) │
│            │   Tab-based content:           │               │
│ ┌────────┐ │   • Dashboard                  │   Chat        │
│ │Dashboard│ │   • Holdings                  │   Interface   │
│ ├────────┤ │   • ESG Analysis               │               │
│ │Holdings │ │   • Screening                 │   A2UI        │
│ ├────────┤ │   • Settings                   │   Components  │
│ │ESG     │ │                                │               │
│ ├────────┤ │                                │               │
│ │Screen  │ │                                │               │
│ ├────────┤ │                                │               │
│ │Settings│ │                                │               │
│ └────────┘ │                                │               │
│            │                                │               │
│ © 2026     │                                │   [✕ Close]   │
└────────────┴────────────────────────────────┴───────────────┘
                                              ┌───────────────┐
                                              │  💬 FAB       │
                                              └───────────────┘
```

### Responsive Behavior
- **Desktop (lg+)**: All 3 panels visible, AI panel slides in/out
- **Mobile (<lg)**: Hamburger menu, sidebar as overlay, AI panel full-width

### Theme System
- **Dark mode**: Bloomberg-style near-black (#0a0a0a) with OKLCH colors
- **Light mode**: Clean white backgrounds
- **Toggle**: Persisted to localStorage, respects system preference

### Color System (ESG Color Coding)
| Score Range | Color | Meaning |
|-------------|-------|---------|
| ≥80 | Green | Excellent/Leader |
| ≥60 | Yellow | Good/Average |
| ≥40 | Orange | Below Average |
| <40 | Red | Poor/Laggard |

---

## Core Features

### 1. Dashboard Tab
**Purpose**: Portfolio overview at a glance

**Implemented Widgets**:
- **Portfolio Summary Card**
  - Total value in CHF with currency formatting
  - Daily change (amount + percentage)
  - Color-coded positive/negative indicators
  - TrendingUp/TrendingDown icons

- **Benchmark Comparison Card**
  - Performance vs MSCI ESG Leaders Index
  - ESG score differential
  - Return differential

- **Sector Allocation Chart**
  - Donut chart with 7 sector colors
  - Interactive tooltips
  - Legend with sector names
  - Percentage breakdown

- **Portfolio ESG Score Card**
  - Large score display (0-100)
  - Progress bar gauge
  - E/S/G component breakdown

### 2. Holdings Tab
**Purpose**: Detailed portfolio positions

**Implemented Features**:
- **HoldingsTablePro Component**
  - Sortable columns (Symbol, Name, Shares, Value, Weight%, ESG)
  - Click-to-sort with direction indicators (↑/↓)
  - Sector filter dropdown
  - Minimum ESG score filter
  - Row actions menu (Remove)
  - Highlight support for emphasized symbols
  - Responsive scroll handling

### 3. ESG Analysis Tab
**Purpose**: Deep ESG portfolio analysis

**Implemented Features**:
- **Portfolio ESG Score** (large display)
- **E/S/G Breakdown** with individual progress bars
- **ESG by Sector** horizontal bar chart
- **Leaders & Laggards**
  - Top 3 highest ESG holdings
  - Bottom 3 improvement areas
  - TrendingUp/Down icons

### 4. Screening Tab
**Purpose**: ESG-focused stock discovery

**Implemented Features**:
- **Sector Filter**: Dropdown with all available sectors
- **ESG Score Filter**: Slider to set minimum ESG threshold (0-100)
- **Sort Options**: Sort by overall ESG, Environmental, Social, or Governance
- **Results Table**: Displays filtered stocks with full E/S/G breakdown
- **Add to Portfolio**: One-click add stocks from screening results
- **Curated Dataset**: ~100 stocks with real Sustainalytics ESG data

### 5. Settings Tab
**Purpose**: User preferences (placeholder implemented)
- Tab content area with title

---

## AI & Chat System

### A2UI Protocol (Agent-to-User Interface)
Google's protocol for LLM-generated rich UI components.

**Parser** (`src/lib/a2ui/parser.ts`):
- Extracts JSON blocks from AI text responses
- Handles balanced braces and string escapes
- Separates: text, components, actions

**Supported Component Types**:

| Component | Props | Purpose |
|-----------|-------|---------|
| `PortfolioSummaryCard` | totalValue, currency, change, changePercent, esgScore | Portfolio overview |
| `ESGScoreGauge` | score, environmental, social, governance | ESG visualization |
| `ESGRadarChart` | symbol, companyName, environmental, social, governance | E/S/G radar visualization |
| `ESGComparisonChart` | companies[] | Multi-company ESG comparison |
| `HoldingsList` | holdings[] | Table of all holdings |
| `HoldingCard` | symbol, name, shares, value, esgScore | Single holding card |
| `StockInfoCard` | symbol, name, price, change, changePercent, currency, exchange, marketCap, esgScore | Stock research |
| `ActionButton` | label, action, variant | Interactive button |
| `ActionConfirmation` | type, symbol, shares, previousShares, newTotal | Action feedback |

**A2UIRenderer Features**:
- Dynamic component mapping
- Groups consecutive ActionButtons horizontally
- Error handling for unknown components
- Props spread for flexibility

### Chat Interface

**Message Types**:
- User messages (right-aligned, blue)
- Assistant messages (left-aligned, gray)
- Loading states with dynamic messages
- Action-pending spinners
- Action confirmations

**Quota System**:
- 20 messages per session (production)
- Unlimited in development mode
- Daily reset
- localStorage persistence
- Low quota warning (≤5)

**Conversation Features**:
- Full conversation history for context
- Multi-turn conversations
- Markdown rendering (react-markdown)
- Auto-scroll to latest message

### AI Actions

**7 Supported Action Types**:

| Action | Payload | Auto-Execute |
|--------|---------|--------------|
| `filter_holdings` | sector?, minEsg?, maxEsg? | ✅ Yes |
| `add_holding` | symbol, shares, name? | ❌ Confirmation |
| `remove_holding` | symbol | ❌ Confirmation |
| `create_alert` | symbol, alertType, value | ❌ Confirmation |
| `navigate` | section | ✅ Yes |
| `highlight` | symbols[] | ✅ Yes |
| `show_comparison` | symbols[] | ✅ Yes |

### Tool Calling (Function Calling)

**3 Available Tools**:

1. **get_portfolio**
   - Returns all holdings with totals
   - Calculates aggregate ESG score
   - Used for: "Show my portfolio", "What's my total value?"

2. **get_holding(symbol)**
   - Returns specific holding details
   - Used for: "How many AAPL shares do I own?"

3. **get_stock_info(symbol)**
   - Fetches real-time price from FMP API
   - Used for: "What's the price of GOOGL?"

**Tool Execution Flow**:
- Max 5 iterations to prevent loops
- Results passed back to LLM
- Final response includes `toolsUsed` array

---

## Portfolio Management

### Data Structures

**Holding Interface**:
```typescript
{
  symbol: string;
  name: string;
  shares: number;
  value: number;
  costBasis?: number;
  weight?: number;
  esgScore: number;
  environmentalScore?: number;
  socialScore?: number;
  governanceScore?: number;
  change?: number;
  sector: string;
  region?: string;
  addedAt?: string;
}
```

**Portfolio Interface**:
```typescript
{
  id: string;
  name: string;
  currency: string; // Default: "CHF"
  totalValue: number;
  dailyChange: number;
  dailyChangePercent: number;
  holdings: Holding[];
  esgScore: number;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  updatedAt: string;
}
```

### Portfolio Calculations

**Value-Weighted ESG Aggregation**:
```
portfolioESG = Σ(holding.esgScore × holding.value) / totalValue
```

**Weight Calculation**:
```
holding.weight = (holding.value / totalValue) × 100
```

**Sector Allocation**:
- Groups holdings by sector
- Calculates value sum per sector
- Computes percentage of total

### Portfolio Actions via Chat

**Add Holding**:
1. User says: "Add 10 shares of GOOGL"
2. AI generates `add_holding` action
3. System fetches current price from `/api/stock`
4. Converts USD → CHF (rate: 0.88)
5. Adds to holdings array
6. Shows ActionConfirmation

**Remove Holding**:
1. User says: "Remove AAPL from my portfolio"
2. AI generates `remove_holding` action
3. Spinner shows "Updating portfolio..."
4. Holding removed from array
5. Shows ActionConfirmation

### Portfolio Initialization

**Empty Start Approach**:
The portfolio starts empty, encouraging users to build it via the AI chat interface:
- "Add 50 shares of AAPL"
- "Add Microsoft to my portfolio"
- "Buy 10 shares of Nestlé"

This demonstrates the chat-based portfolio management capabilities and allows for personalized demo experiences.

---

## ESG Data & Scoring

### ESG Data Structure

```typescript
interface ESGData {
  symbol: string;
  companyName: string;
  esgScore: number;        // 0-100
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  lastUpdated: string;     // ISO 8601
}
```

### Score Normalization

**Multi-Provider Support**:
- FMP (0-100, pass-through)
- Sustainalytics (0-100, inverted)
- Refinitiv (0-100)
- Bloomberg (0-100)
- MSCI (letter grades → numeric)
- S&P Global (0-100)

**Letter Grade Conversion**:
| Grade | Score |
|-------|-------|
| AAA | 95 |
| AA | 85 |
| A | 77 |
| BBB | 65 |
| BB | 55 |
| B | 45 |
| CCC | 35 |

**Rating Labels**:
| Score | Label |
|-------|-------|
| ≥80 | Leader |
| ≥65 | Strong Performer |
| ≥50 | Average |
| ≥35 | Below Average |
| <35 | Laggard |

### ESG Display Components

**ESGScoreGauge**:
- Large score display (text-4xl)
- Color-coded progress bar
- Optional E/S/G breakdown grid

**ESGDashboard**:
- Portfolio ESG with breakdown
- Sector average bar chart
- Leaders & Laggards section

### Caching Strategy

**In-Memory Cache**:
- ESG data: 24-hour TTL
- Stock quotes: 5-minute TTL

**Supabase Cache** (Optional):
- `esg_cache` table
- `getCachedESG()`, `cacheESG()`, `getCachedESGBatch()`

---

## Stock Screening

### Filter Capabilities

**HoldingsTablePro Filters**:
- Sector dropdown (unique sectors from holdings)
- Minimum ESG score input (0-100)
- Sortable columns

**AI-Powered Screening**:
- "Show technology stocks"
- "Find stocks with ESG above 80"
- "Filter European tech with ESG > 70"

### Filter Action

```typescript
{
  action: {
    type: "filter_holdings",
    payload: {
      sector?: string;
      minEsg?: number;
      maxEsg?: number;
    }
  }
}
```

---

## Data Visualization

### Charts (Recharts)

**1. Sector Allocation Chart**
- Type: Donut/Pie Chart
- Inner radius: 60px (donut effect)
- Outer radius: 80px
- Colors: Sector-specific (Technology blue, Healthcare pink, etc.)
- Features: Tooltips, Legend, Click-to-filter

**2. Performance Chart**
- Type: Line Chart
- Time ranges: 1D, 1W, 1M, 3M, 1Y, ALL
- Features: Benchmark overlay (dashed), CartesianGrid, Tooltips
- Color: Green (positive), Red (negative)

**3. ESG by Sector Chart**
- Type: Horizontal Bar Chart
- Shows average ESG per sector
- Color-coded by score

### Progress Indicators

**ESG Progress Bars**:
- Dynamic color based on score
- Smooth transitions
- Used in PortfolioOverview and ESGDashboard

---

## API Integration

### POST `/api/chat`

**Request**:
```typescript
{
  message: string;
  history?: Array<{role: "user" | "assistant", content: string}>;
  holdings?: PortfolioHolding[];
}
```

**Response**:
```typescript
{
  message: string;
  role: "assistant";
  toolsUsed?: string[];
}
```

**Features**:
- Real LLM (OpenRouter) or mock mode
- Tool calling support
- Rate limit handling
- Fallback to mock on errors

### GET `/api/esg`

**Request**: `?symbols=AAPL,MSFT,NVDA` (max 20)

**Response**:
```typescript
{
  data: { [symbol]: ESGData | null };
  timestamp: string;
}
```

### GET `/api/stock`

**Request**: `?symbol=AAPL`

**Response**:
```typescript
{
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: "USD";
  exchange: string;
  marketCap: number;
  timestamp: string;
}
```

### External APIs

**OpenRouter** (LLM):
- Model: xiaomi/mimo-v2-flash:free
- Temperature: 0.7
- Max tokens: 4096
- Headers: HTTP-Referer, X-Title

**Financial Modeling Prep** (Market Data):
- ESG ratings endpoint
- Stock quote endpoint
- Free tier: 250 requests/day

**Supabase** (Database):
- portfolios, holdings, transactions, alerts, esg_cache tables
- Real-time capabilities (not currently used)

---

## State Management

### Global State (Context)

**ThemeProvider**:
- State: `theme: "light" | "dark"`
- Persistence: localStorage
- Hook: `useTheme()`

### Page-Level State

**Home Page (`page.tsx`)**:
```typescript
activeSection: NavigationSection
selectedPortfolioId: string
holdings: Holding[]
aiPanelOpen: boolean
```

### Component State

**Chat Component**:
```typescript
messages: ExtendedChatMessage[]
conversationHistory: ConversationMessage[]
isLoading: boolean
loadingMessage: string
messagesRemaining: number
```

### Custom Hooks

**useAIActions**:
- Parses AI responses for actions
- Queues destructive actions
- Executes safe actions automatically
- Manages highlights, filters, comparisons

**useIsMobile**:
- Detects viewport < 768px
- Listens for resize events

### Persistence

| Key | Storage | Data |
|-----|---------|------|
| `theme` | localStorage | "light" \| "dark" |
| `chat_quota` | localStorage | `{remaining, date}` |

---

## Testing Infrastructure

### E2E Tests (Playwright)

**14 Test Suites**:
| Epic | Test File | Focus |
|------|-----------|-------|
| 1 | epic-1-infrastructure.spec.ts | App loading, styling |
| 2 | epic-2-a2ui.spec.ts | A2UI components |
| 3 | epic-3-chat.spec.ts | Chat interface |
| 4 | epic-4-portfolio.spec.ts | Portfolio management |
| 5 | epic-5-esg.spec.ts | ESG data |
| 7 | epic-7-screening.spec.ts | Filtering |
| 9 | epic-9-security.spec.ts | Security |
| 10 | epic-10-dashboard.spec.ts | Dashboard |
| 14 | epic-14-openrouter.spec.ts | OpenRouter |

### Test Commands

```bash
bun test              # Run all tests
bun test:epic1        # Run specific epic
bun test:ui           # Interactive mode
bun test:report       # View HTML report
```

### Data-Testid Conventions

**Navigation**:
- `dashboard-sidebar`, `dashboard-header`, `dashboard-main`
- `nav-dashboard`, `nav-holdings`, `nav-esg`, etc.

**Portfolio**:
- `portfolio-content`, `portfolio-summary`, `portfolio-value`
- `portfolio-change`, `portfolio-esg`, `allocation-chart`

**Holdings**:
- `holdings-content`, `holdings-list`, `holding-row`
- `holdings-table-pro`, `sector-filter`, `esg-filter`

**ESG**:
- `esg-content`, `esg-breakdown`, `esg-gauge`
- `e-score`, `s-score`, `g-score`

**Chat**:
- `chat-content`, `chat-input`, `send-button`
- `user-message`, `assistant-message`, `a2ui-component`
- `loading`, `quota`, `floating-ai-button`, `ai-panel`

---

## Summary of Implemented Features

### Fully Implemented
- [x] 3-panel responsive layout (Sidebar, Main, AI Panel)
- [x] 5-tab navigation system
- [x] Dark/light theme with persistence
- [x] AI chat with OpenRouter LLM
- [x] A2UI protocol with 9 component types
- [x] Tool calling (get_portfolio, get_holding, get_stock_info)
- [x] 7 AI action types with execution flow
- [x] Portfolio display (empty start, build via chat)
- [x] Real-time ESG data fetching (FMP API)
- [x] Real-time stock prices (FMP API)
- [x] Add/remove holdings via chat
- [x] ESG score aggregation (value-weighted)
- [x] E/S/G component breakdown
- [x] Sector allocation chart
- [x] Performance chart with time ranges
- [x] ESG by sector analysis
- [x] Leaders & Laggards identification
- [x] Holdings table with sort/filter
- [x] Message quota system
- [x] Mock mode for testing
- [x] Comprehensive E2E tests
- [x] ESG score normalization (multi-provider)
- [x] In-memory caching with TTL
- [x] Curated ESG dataset (~100 stocks from Sustainalytics)
- [x] ESG Screening tab with filtering and sorting
- [x] ESG Radar and Comparison chart components

### Placeholder/Partial
- [ ] Settings tab (UI only, no functionality)
- [ ] Persistent database storage (Supabase schema defined)
- [ ] User authentication
- [ ] Transaction history tracking
- [ ] Alert system (types defined, not wired)
- [ ] Benchmark comparison (mock data only)
- [ ] Real performance history data

---

*Document generated: January 2026*
*Version: 1.0.0*
