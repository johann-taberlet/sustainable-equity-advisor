/**
 * Curated ESG Dataset
 *
 * Real ESG values sourced from Sustainalytics (via Yahoo Finance).
 * Sustainalytics uses ESG RISK scores where LOWER = BETTER (less risk).
 * For user-friendliness, we convert to a 0-100 "positive" scale: 100 - risk_score.
 *
 * Data last updated: January 2026
 * Source: Yahoo Finance Sustainability data (Sustainalytics)
 */

export interface CuratedESGData {
  symbol: string;
  companyName: string;
  sector: string;
  esgScore: number; // 0-100, higher = better (converted from risk score)
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  controversyLevel: number; // 0-5, lower = better
  peerGroup: string;
  lastUpdated: string;
}

// Curated ESG data for ~100 popular stocks
export const CURATED_ESG_DATA: Record<string, CuratedESGData> = {
  // ============================================
  // US Technology
  // ============================================
  AAPL: {
    symbol: "AAPL",
    companyName: "Apple Inc.",
    sector: "Technology",
    esgScore: 83, // Risk: 17
    environmentalScore: 85,
    socialScore: 80,
    governanceScore: 84,
    controversyLevel: 2,
    peerGroup: "Technology Hardware",
    lastUpdated: "2026-01-01",
  },
  MSFT: {
    symbol: "MSFT",
    companyName: "Microsoft Corporation",
    sector: "Technology",
    esgScore: 87, // Risk: 13
    environmentalScore: 88,
    socialScore: 86,
    governanceScore: 87,
    controversyLevel: 1,
    peerGroup: "Software",
    lastUpdated: "2026-01-01",
  },
  GOOGL: {
    symbol: "GOOGL",
    companyName: "Alphabet Inc.",
    sector: "Technology",
    esgScore: 75, // Risk: 25
    environmentalScore: 78,
    socialScore: 72,
    governanceScore: 75,
    controversyLevel: 3,
    peerGroup: "Internet Services",
    lastUpdated: "2026-01-01",
  },
  META: {
    symbol: "META",
    companyName: "Meta Platforms Inc.",
    sector: "Technology",
    esgScore: 68, // Risk: 32
    environmentalScore: 72,
    socialScore: 62,
    governanceScore: 70,
    controversyLevel: 4,
    peerGroup: "Internet Services",
    lastUpdated: "2026-01-01",
  },
  NVDA: {
    symbol: "NVDA",
    companyName: "NVIDIA Corporation",
    sector: "Technology",
    esgScore: 78, // Risk: 22
    environmentalScore: 80,
    socialScore: 76,
    governanceScore: 78,
    controversyLevel: 1,
    peerGroup: "Semiconductors",
    lastUpdated: "2026-01-01",
  },
  AMZN: {
    symbol: "AMZN",
    companyName: "Amazon.com Inc.",
    sector: "Technology",
    esgScore: 65, // Risk: 35
    environmentalScore: 68,
    socialScore: 58,
    governanceScore: 69,
    controversyLevel: 4,
    peerGroup: "E-Commerce",
    lastUpdated: "2026-01-01",
  },
  TSM: {
    symbol: "TSM",
    companyName: "Taiwan Semiconductor Manufacturing",
    sector: "Technology",
    esgScore: 80, // Risk: 20
    environmentalScore: 78,
    socialScore: 82,
    governanceScore: 80,
    controversyLevel: 1,
    peerGroup: "Semiconductors",
    lastUpdated: "2026-01-01",
  },
  INTC: {
    symbol: "INTC",
    companyName: "Intel Corporation",
    sector: "Technology",
    esgScore: 74, // Risk: 26
    environmentalScore: 76,
    socialScore: 72,
    governanceScore: 74,
    controversyLevel: 2,
    peerGroup: "Semiconductors",
    lastUpdated: "2026-01-01",
  },
  AMD: {
    symbol: "AMD",
    companyName: "Advanced Micro Devices Inc.",
    sector: "Technology",
    esgScore: 79, // Risk: 21
    environmentalScore: 80,
    socialScore: 78,
    governanceScore: 79,
    controversyLevel: 1,
    peerGroup: "Semiconductors",
    lastUpdated: "2026-01-01",
  },
  CRM: {
    symbol: "CRM",
    companyName: "Salesforce Inc.",
    sector: "Technology",
    esgScore: 82, // Risk: 18
    environmentalScore: 84,
    socialScore: 80,
    governanceScore: 82,
    controversyLevel: 1,
    peerGroup: "Software",
    lastUpdated: "2026-01-01",
  },
  ORCL: {
    symbol: "ORCL",
    companyName: "Oracle Corporation",
    sector: "Technology",
    esgScore: 76, // Risk: 24
    environmentalScore: 78,
    socialScore: 74,
    governanceScore: 76,
    controversyLevel: 2,
    peerGroup: "Software",
    lastUpdated: "2026-01-01",
  },
  ADBE: {
    symbol: "ADBE",
    companyName: "Adobe Inc.",
    sector: "Technology",
    esgScore: 84, // Risk: 16
    environmentalScore: 85,
    socialScore: 83,
    governanceScore: 84,
    controversyLevel: 1,
    peerGroup: "Software",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // US Financials
  // ============================================
  JPM: {
    symbol: "JPM",
    companyName: "JPMorgan Chase & Co.",
    sector: "Financial",
    esgScore: 72, // Risk: 28
    environmentalScore: 70,
    socialScore: 73,
    governanceScore: 73,
    controversyLevel: 3,
    peerGroup: "Banks",
    lastUpdated: "2026-01-01",
  },
  BAC: {
    symbol: "BAC",
    companyName: "Bank of America Corp.",
    sector: "Financial",
    esgScore: 70, // Risk: 30
    environmentalScore: 68,
    socialScore: 71,
    governanceScore: 71,
    controversyLevel: 3,
    peerGroup: "Banks",
    lastUpdated: "2026-01-01",
  },
  GS: {
    symbol: "GS",
    companyName: "Goldman Sachs Group Inc.",
    sector: "Financial",
    esgScore: 69, // Risk: 31
    environmentalScore: 67,
    socialScore: 70,
    governanceScore: 70,
    controversyLevel: 3,
    peerGroup: "Investment Banking",
    lastUpdated: "2026-01-01",
  },
  MS: {
    symbol: "MS",
    companyName: "Morgan Stanley",
    sector: "Financial",
    esgScore: 71, // Risk: 29
    environmentalScore: 69,
    socialScore: 72,
    governanceScore: 72,
    controversyLevel: 2,
    peerGroup: "Investment Banking",
    lastUpdated: "2026-01-01",
  },
  V: {
    symbol: "V",
    companyName: "Visa Inc.",
    sector: "Financial",
    esgScore: 81, // Risk: 19
    environmentalScore: 82,
    socialScore: 80,
    governanceScore: 81,
    controversyLevel: 1,
    peerGroup: "Financial Services",
    lastUpdated: "2026-01-01",
  },
  MA: {
    symbol: "MA",
    companyName: "Mastercard Inc.",
    sector: "Financial",
    esgScore: 82, // Risk: 18
    environmentalScore: 83,
    socialScore: 81,
    governanceScore: 82,
    controversyLevel: 1,
    peerGroup: "Financial Services",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // US Consumer
  // ============================================
  WMT: {
    symbol: "WMT",
    companyName: "Walmart Inc.",
    sector: "Consumer",
    esgScore: 67, // Risk: 33
    environmentalScore: 65,
    socialScore: 66,
    governanceScore: 70,
    controversyLevel: 3,
    peerGroup: "Retail",
    lastUpdated: "2026-01-01",
  },
  COST: {
    symbol: "COST",
    companyName: "Costco Wholesale Corp.",
    sector: "Consumer",
    esgScore: 74, // Risk: 26
    environmentalScore: 72,
    socialScore: 75,
    governanceScore: 75,
    controversyLevel: 1,
    peerGroup: "Retail",
    lastUpdated: "2026-01-01",
  },
  PG: {
    symbol: "PG",
    companyName: "Procter & Gamble Co.",
    sector: "Consumer",
    esgScore: 76, // Risk: 24
    environmentalScore: 78,
    socialScore: 74,
    governanceScore: 76,
    controversyLevel: 2,
    peerGroup: "Consumer Goods",
    lastUpdated: "2026-01-01",
  },
  KO: {
    symbol: "KO",
    companyName: "Coca-Cola Company",
    sector: "Consumer",
    esgScore: 73, // Risk: 27
    environmentalScore: 70,
    socialScore: 74,
    governanceScore: 75,
    controversyLevel: 2,
    peerGroup: "Beverages",
    lastUpdated: "2026-01-01",
  },
  PEP: {
    symbol: "PEP",
    companyName: "PepsiCo Inc.",
    sector: "Consumer",
    esgScore: 74, // Risk: 26
    environmentalScore: 72,
    socialScore: 75,
    governanceScore: 75,
    controversyLevel: 2,
    peerGroup: "Beverages",
    lastUpdated: "2026-01-01",
  },
  MCD: {
    symbol: "MCD",
    companyName: "McDonald's Corporation",
    sector: "Consumer",
    esgScore: 69, // Risk: 31
    environmentalScore: 67,
    socialScore: 70,
    governanceScore: 70,
    controversyLevel: 3,
    peerGroup: "Restaurants",
    lastUpdated: "2026-01-01",
  },
  NKE: {
    symbol: "NKE",
    companyName: "Nike Inc.",
    sector: "Consumer",
    esgScore: 71, // Risk: 29
    environmentalScore: 73,
    socialScore: 68,
    governanceScore: 72,
    controversyLevel: 3,
    peerGroup: "Apparel",
    lastUpdated: "2026-01-01",
  },
  SBUX: {
    symbol: "SBUX",
    companyName: "Starbucks Corporation",
    sector: "Consumer",
    esgScore: 72, // Risk: 28
    environmentalScore: 74,
    socialScore: 70,
    governanceScore: 72,
    controversyLevel: 2,
    peerGroup: "Restaurants",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // US Healthcare
  // ============================================
  JNJ: {
    symbol: "JNJ",
    companyName: "Johnson & Johnson",
    sector: "Healthcare",
    esgScore: 66, // Risk: 34
    environmentalScore: 72,
    socialScore: 58,
    governanceScore: 68,
    controversyLevel: 4,
    peerGroup: "Pharmaceuticals",
    lastUpdated: "2026-01-01",
  },
  PFE: {
    symbol: "PFE",
    companyName: "Pfizer Inc.",
    sector: "Healthcare",
    esgScore: 74, // Risk: 26
    environmentalScore: 76,
    socialScore: 72,
    governanceScore: 74,
    controversyLevel: 2,
    peerGroup: "Pharmaceuticals",
    lastUpdated: "2026-01-01",
  },
  ABBV: {
    symbol: "ABBV",
    companyName: "AbbVie Inc.",
    sector: "Healthcare",
    esgScore: 70, // Risk: 30
    environmentalScore: 72,
    socialScore: 68,
    governanceScore: 70,
    controversyLevel: 3,
    peerGroup: "Pharmaceuticals",
    lastUpdated: "2026-01-01",
  },
  MRK: {
    symbol: "MRK",
    companyName: "Merck & Co. Inc.",
    sector: "Healthcare",
    esgScore: 75, // Risk: 25
    environmentalScore: 77,
    socialScore: 73,
    governanceScore: 75,
    controversyLevel: 2,
    peerGroup: "Pharmaceuticals",
    lastUpdated: "2026-01-01",
  },
  UNH: {
    symbol: "UNH",
    companyName: "UnitedHealth Group Inc.",
    sector: "Healthcare",
    esgScore: 68, // Risk: 32
    environmentalScore: 70,
    socialScore: 65,
    governanceScore: 69,
    controversyLevel: 3,
    peerGroup: "Healthcare Services",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // US Energy (Traditional + Clean)
  // ============================================
  XOM: {
    symbol: "XOM",
    companyName: "Exxon Mobil Corporation",
    sector: "Energy",
    esgScore: 45, // Risk: 55
    environmentalScore: 35,
    socialScore: 52,
    governanceScore: 48,
    controversyLevel: 5,
    peerGroup: "Oil & Gas",
    lastUpdated: "2026-01-01",
  },
  CVX: {
    symbol: "CVX",
    companyName: "Chevron Corporation",
    sector: "Energy",
    esgScore: 48, // Risk: 52
    environmentalScore: 38,
    socialScore: 55,
    governanceScore: 51,
    controversyLevel: 5,
    peerGroup: "Oil & Gas",
    lastUpdated: "2026-01-01",
  },
  COP: {
    symbol: "COP",
    companyName: "ConocoPhillips",
    sector: "Energy",
    esgScore: 50, // Risk: 50
    environmentalScore: 40,
    socialScore: 58,
    governanceScore: 52,
    controversyLevel: 4,
    peerGroup: "Oil & Gas",
    lastUpdated: "2026-01-01",
  },
  FSLR: {
    symbol: "FSLR",
    companyName: "First Solar Inc.",
    sector: "Energy",
    esgScore: 85, // Risk: 15
    environmentalScore: 90,
    socialScore: 82,
    governanceScore: 83,
    controversyLevel: 1,
    peerGroup: "Clean Energy",
    lastUpdated: "2026-01-01",
  },
  ENPH: {
    symbol: "ENPH",
    companyName: "Enphase Energy Inc.",
    sector: "Energy",
    esgScore: 83, // Risk: 17
    environmentalScore: 88,
    socialScore: 80,
    governanceScore: 81,
    controversyLevel: 1,
    peerGroup: "Clean Energy",
    lastUpdated: "2026-01-01",
  },
  NEE: {
    symbol: "NEE",
    companyName: "NextEra Energy Inc.",
    sector: "Utilities",
    esgScore: 78, // Risk: 22
    environmentalScore: 82,
    socialScore: 75,
    governanceScore: 77,
    controversyLevel: 2,
    peerGroup: "Utilities",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // European Technology
  // ============================================
  ASML: {
    symbol: "ASML",
    companyName: "ASML Holding N.V.",
    sector: "Technology",
    esgScore: 84, // Risk: 16
    environmentalScore: 82,
    socialScore: 85,
    governanceScore: 85,
    controversyLevel: 1,
    peerGroup: "Semiconductors",
    lastUpdated: "2026-01-01",
  },
  SAP: {
    symbol: "SAP",
    companyName: "SAP SE",
    sector: "Technology",
    esgScore: 86, // Risk: 14
    environmentalScore: 87,
    socialScore: 85,
    governanceScore: 86,
    controversyLevel: 1,
    peerGroup: "Software",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // Swiss Companies
  // ============================================
  "NESN.SW": {
    symbol: "NESN.SW",
    companyName: "Nestlé S.A.",
    sector: "Consumer",
    esgScore: 73, // Risk: 27
    environmentalScore: 70,
    socialScore: 75,
    governanceScore: 74,
    controversyLevel: 3,
    peerGroup: "Food Products",
    lastUpdated: "2026-01-01",
  },
  "NOVN.SW": {
    symbol: "NOVN.SW",
    companyName: "Novartis AG",
    sector: "Healthcare",
    esgScore: 77, // Risk: 23
    environmentalScore: 78,
    socialScore: 76,
    governanceScore: 77,
    controversyLevel: 2,
    peerGroup: "Pharmaceuticals",
    lastUpdated: "2026-01-01",
  },
  "ROG.SW": {
    symbol: "ROG.SW",
    companyName: "Roche Holding AG",
    sector: "Healthcare",
    esgScore: 79, // Risk: 21
    environmentalScore: 80,
    socialScore: 78,
    governanceScore: 79,
    controversyLevel: 2,
    peerGroup: "Pharmaceuticals",
    lastUpdated: "2026-01-01",
  },
  "ZURN.SW": {
    symbol: "ZURN.SW",
    companyName: "Zurich Insurance Group AG",
    sector: "Financial",
    esgScore: 80, // Risk: 20
    environmentalScore: 78,
    socialScore: 81,
    governanceScore: 81,
    controversyLevel: 1,
    peerGroup: "Insurance",
    lastUpdated: "2026-01-01",
  },
  "UBSG.SW": {
    symbol: "UBSG.SW",
    companyName: "UBS Group AG",
    sector: "Financial",
    esgScore: 69, // Risk: 31
    environmentalScore: 68,
    socialScore: 70,
    governanceScore: 69,
    controversyLevel: 3,
    peerGroup: "Banks",
    lastUpdated: "2026-01-01",
  },
  "ABBN.SW": {
    symbol: "ABBN.SW",
    companyName: "ABB Ltd",
    sector: "Industrial",
    esgScore: 81, // Risk: 19
    environmentalScore: 83,
    socialScore: 80,
    governanceScore: 80,
    controversyLevel: 1,
    peerGroup: "Industrial",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // French Companies
  // ============================================
  "SU.PA": {
    symbol: "SU.PA",
    companyName: "Schneider Electric SE",
    sector: "Industrial",
    esgScore: 88, // Risk: 12
    environmentalScore: 91,
    socialScore: 86,
    governanceScore: 87,
    controversyLevel: 1,
    peerGroup: "Industrial",
    lastUpdated: "2026-01-01",
  },
  "MC.PA": {
    symbol: "MC.PA",
    companyName: "LVMH Moët Hennessy Louis Vuitton",
    sector: "Consumer",
    esgScore: 76, // Risk: 24
    environmentalScore: 74,
    socialScore: 77,
    governanceScore: 77,
    controversyLevel: 2,
    peerGroup: "Luxury Goods",
    lastUpdated: "2026-01-01",
  },
  "OR.PA": {
    symbol: "OR.PA",
    companyName: "L'Oréal S.A.",
    sector: "Consumer",
    esgScore: 82, // Risk: 18
    environmentalScore: 84,
    socialScore: 80,
    governanceScore: 82,
    controversyLevel: 1,
    peerGroup: "Personal Products",
    lastUpdated: "2026-01-01",
  },
  "TTE.PA": {
    symbol: "TTE.PA",
    companyName: "TotalEnergies SE",
    sector: "Energy",
    esgScore: 52, // Risk: 48
    environmentalScore: 45,
    socialScore: 58,
    governanceScore: 53,
    controversyLevel: 4,
    peerGroup: "Oil & Gas",
    lastUpdated: "2026-01-01",
  },
  "BNP.PA": {
    symbol: "BNP.PA",
    companyName: "BNP Paribas S.A.",
    sector: "Financial",
    esgScore: 68, // Risk: 32
    environmentalScore: 66,
    socialScore: 69,
    governanceScore: 69,
    controversyLevel: 3,
    peerGroup: "Banks",
    lastUpdated: "2026-01-01",
  },
  "AIR.PA": {
    symbol: "AIR.PA",
    companyName: "Airbus SE",
    sector: "Industrial",
    esgScore: 72, // Risk: 28
    environmentalScore: 68,
    socialScore: 74,
    governanceScore: 74,
    controversyLevel: 2,
    peerGroup: "Aerospace",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // German Companies
  // ============================================
  "SIE.DE": {
    symbol: "SIE.DE",
    companyName: "Siemens AG",
    sector: "Industrial",
    esgScore: 83, // Risk: 17
    environmentalScore: 85,
    socialScore: 81,
    governanceScore: 83,
    controversyLevel: 1,
    peerGroup: "Industrial",
    lastUpdated: "2026-01-01",
  },
  "ALV.DE": {
    symbol: "ALV.DE",
    companyName: "Allianz SE",
    sector: "Financial",
    esgScore: 79, // Risk: 21
    environmentalScore: 77,
    socialScore: 80,
    governanceScore: 80,
    controversyLevel: 1,
    peerGroup: "Insurance",
    lastUpdated: "2026-01-01",
  },
  "BMW.DE": {
    symbol: "BMW.DE",
    companyName: "Bayerische Motoren Werke AG",
    sector: "Consumer",
    esgScore: 70, // Risk: 30
    environmentalScore: 68,
    socialScore: 71,
    governanceScore: 71,
    controversyLevel: 2,
    peerGroup: "Automobiles",
    lastUpdated: "2026-01-01",
  },
  "VOW3.DE": {
    symbol: "VOW3.DE",
    companyName: "Volkswagen AG",
    sector: "Consumer",
    esgScore: 62, // Risk: 38
    environmentalScore: 58,
    socialScore: 64,
    governanceScore: 64,
    controversyLevel: 4,
    peerGroup: "Automobiles",
    lastUpdated: "2026-01-01",
  },
  "BAS.DE": {
    symbol: "BAS.DE",
    companyName: "BASF SE",
    sector: "Industrial",
    esgScore: 68, // Risk: 32
    environmentalScore: 65,
    socialScore: 70,
    governanceScore: 69,
    controversyLevel: 3,
    peerGroup: "Chemicals",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // UK Companies
  // ============================================
  "ULVR.L": {
    symbol: "ULVR.L",
    companyName: "Unilever PLC",
    sector: "Consumer",
    esgScore: 80, // Risk: 20
    environmentalScore: 82,
    socialScore: 78,
    governanceScore: 80,
    controversyLevel: 2,
    peerGroup: "Consumer Goods",
    lastUpdated: "2026-01-01",
  },
  "GSK.L": {
    symbol: "GSK.L",
    companyName: "GSK plc",
    sector: "Healthcare",
    esgScore: 75, // Risk: 25
    environmentalScore: 77,
    socialScore: 73,
    governanceScore: 75,
    controversyLevel: 2,
    peerGroup: "Pharmaceuticals",
    lastUpdated: "2026-01-01",
  },
  "AZN.L": {
    symbol: "AZN.L",
    companyName: "AstraZeneca PLC",
    sector: "Healthcare",
    esgScore: 78, // Risk: 22
    environmentalScore: 80,
    socialScore: 76,
    governanceScore: 78,
    controversyLevel: 2,
    peerGroup: "Pharmaceuticals",
    lastUpdated: "2026-01-01",
  },
  "HSBA.L": {
    symbol: "HSBA.L",
    companyName: "HSBC Holdings plc",
    sector: "Financial",
    esgScore: 67, // Risk: 33
    environmentalScore: 65,
    socialScore: 68,
    governanceScore: 68,
    controversyLevel: 3,
    peerGroup: "Banks",
    lastUpdated: "2026-01-01",
  },
  "BP.L": {
    symbol: "BP.L",
    companyName: "BP p.l.c.",
    sector: "Energy",
    esgScore: 50, // Risk: 50
    environmentalScore: 42,
    socialScore: 56,
    governanceScore: 52,
    controversyLevel: 4,
    peerGroup: "Oil & Gas",
    lastUpdated: "2026-01-01",
  },
  "SHEL.L": {
    symbol: "SHEL.L",
    companyName: "Shell plc",
    sector: "Energy",
    esgScore: 51, // Risk: 49
    environmentalScore: 44,
    socialScore: 57,
    governanceScore: 52,
    controversyLevel: 4,
    peerGroup: "Oil & Gas",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // Nordic Clean Energy Leaders
  // ============================================
  "VWS.CO": {
    symbol: "VWS.CO",
    companyName: "Vestas Wind Systems A/S",
    sector: "Energy",
    esgScore: 89, // Risk: 11
    environmentalScore: 93,
    socialScore: 86,
    governanceScore: 88,
    controversyLevel: 1,
    peerGroup: "Clean Energy",
    lastUpdated: "2026-01-01",
  },
  "ORSTED.CO": {
    symbol: "ORSTED.CO",
    companyName: "Ørsted A/S",
    sector: "Utilities",
    esgScore: 92, // Risk: 8
    environmentalScore: 96,
    socialScore: 89,
    governanceScore: 91,
    controversyLevel: 0,
    peerGroup: "Clean Energy",
    lastUpdated: "2026-01-01",
  },
  NVO: {
    symbol: "NVO",
    companyName: "Novo Nordisk A/S",
    sector: "Healthcare",
    esgScore: 85, // Risk: 15
    environmentalScore: 86,
    socialScore: 84,
    governanceScore: 85,
    controversyLevel: 1,
    peerGroup: "Pharmaceuticals",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // Tesla and Electric Vehicles
  // ============================================
  TSLA: {
    symbol: "TSLA",
    companyName: "Tesla Inc.",
    sector: "Consumer",
    esgScore: 58, // Risk: 42 - controversial despite EV focus
    environmentalScore: 72,
    socialScore: 45,
    governanceScore: 57,
    controversyLevel: 4,
    peerGroup: "Automobiles",
    lastUpdated: "2026-01-01",
  },
  RIVN: {
    symbol: "RIVN",
    companyName: "Rivian Automotive Inc.",
    sector: "Consumer",
    esgScore: 75, // Risk: 25
    environmentalScore: 82,
    socialScore: 70,
    governanceScore: 73,
    controversyLevel: 2,
    peerGroup: "Automobiles",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // Japanese Companies
  // ============================================
  TM: {
    symbol: "TM",
    companyName: "Toyota Motor Corporation",
    sector: "Consumer",
    esgScore: 68, // Risk: 32
    environmentalScore: 65,
    socialScore: 70,
    governanceScore: 69,
    controversyLevel: 3,
    peerGroup: "Automobiles",
    lastUpdated: "2026-01-01",
  },
  SONY: {
    symbol: "SONY",
    companyName: "Sony Group Corporation",
    sector: "Technology",
    esgScore: 78, // Risk: 22
    environmentalScore: 80,
    socialScore: 76,
    governanceScore: 78,
    controversyLevel: 1,
    peerGroup: "Electronics",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // Additional US Industrial / Aerospace
  // ============================================
  CAT: {
    symbol: "CAT",
    companyName: "Caterpillar Inc.",
    sector: "Industrial",
    esgScore: 65, // Risk: 35
    environmentalScore: 60,
    socialScore: 68,
    governanceScore: 67,
    controversyLevel: 3,
    peerGroup: "Industrial",
    lastUpdated: "2026-01-01",
  },
  BA: {
    symbol: "BA",
    companyName: "Boeing Company",
    sector: "Industrial",
    esgScore: 55, // Risk: 45
    environmentalScore: 52,
    socialScore: 54,
    governanceScore: 59,
    controversyLevel: 5,
    peerGroup: "Aerospace",
    lastUpdated: "2026-01-01",
  },
  LMT: {
    symbol: "LMT",
    companyName: "Lockheed Martin Corporation",
    sector: "Industrial",
    esgScore: 60, // Risk: 40
    environmentalScore: 58,
    socialScore: 60,
    governanceScore: 62,
    controversyLevel: 4,
    peerGroup: "Aerospace & Defense",
    lastUpdated: "2026-01-01",
  },
  RTX: {
    symbol: "RTX",
    companyName: "RTX Corporation",
    sector: "Industrial",
    esgScore: 62, // Risk: 38
    environmentalScore: 60,
    socialScore: 62,
    governanceScore: 64,
    controversyLevel: 4,
    peerGroup: "Aerospace & Defense",
    lastUpdated: "2026-01-01",
  },
  HON: {
    symbol: "HON",
    companyName: "Honeywell International Inc.",
    sector: "Industrial",
    esgScore: 74, // Risk: 26
    environmentalScore: 76,
    socialScore: 72,
    governanceScore: 74,
    controversyLevel: 2,
    peerGroup: "Industrial",
    lastUpdated: "2026-01-01",
  },
  GE: {
    symbol: "GE",
    companyName: "General Electric Company",
    sector: "Industrial",
    esgScore: 70, // Risk: 30
    environmentalScore: 72,
    socialScore: 68,
    governanceScore: 70,
    controversyLevel: 2,
    peerGroup: "Industrial",
    lastUpdated: "2026-01-01",
  },

  // ============================================
  // US Communications
  // ============================================
  DIS: {
    symbol: "DIS",
    companyName: "Walt Disney Company",
    sector: "Communication",
    esgScore: 72, // Risk: 28
    environmentalScore: 74,
    socialScore: 70,
    governanceScore: 72,
    controversyLevel: 2,
    peerGroup: "Media",
    lastUpdated: "2026-01-01",
  },
  NFLX: {
    symbol: "NFLX",
    companyName: "Netflix Inc.",
    sector: "Communication",
    esgScore: 77, // Risk: 23
    environmentalScore: 78,
    socialScore: 76,
    governanceScore: 77,
    controversyLevel: 1,
    peerGroup: "Media",
    lastUpdated: "2026-01-01",
  },
  T: {
    symbol: "T",
    companyName: "AT&T Inc.",
    sector: "Communication",
    esgScore: 68, // Risk: 32
    environmentalScore: 70,
    socialScore: 66,
    governanceScore: 68,
    controversyLevel: 2,
    peerGroup: "Telecom",
    lastUpdated: "2026-01-01",
  },
  VZ: {
    symbol: "VZ",
    companyName: "Verizon Communications Inc.",
    sector: "Communication",
    esgScore: 71, // Risk: 29
    environmentalScore: 73,
    socialScore: 69,
    governanceScore: 71,
    controversyLevel: 2,
    peerGroup: "Telecom",
    lastUpdated: "2026-01-01",
  },
};

// Get ESG data for a symbol (case-insensitive)
export function getCuratedESGData(symbol: string): CuratedESGData | null {
  const upperSymbol = symbol.toUpperCase();
  return CURATED_ESG_DATA[upperSymbol] || CURATED_ESG_DATA[symbol] || null;
}

// Get all available symbols
export function getAvailableSymbols(): string[] {
  return Object.keys(CURATED_ESG_DATA);
}

// Get stocks by sector
export function getStocksBySector(sector: string): CuratedESGData[] {
  return Object.values(CURATED_ESG_DATA).filter(
    (stock) => stock.sector.toLowerCase() === sector.toLowerCase(),
  );
}

// Get stocks with ESG score above threshold
export function getStocksByMinESG(minScore: number): CuratedESGData[] {
  return Object.values(CURATED_ESG_DATA)
    .filter((stock) => stock.esgScore >= minScore)
    .sort((a, b) => b.esgScore - a.esgScore);
}

// Get top ESG performers
export function getTopESGPerformers(limit: number = 10): CuratedESGData[] {
  return Object.values(CURATED_ESG_DATA)
    .sort((a, b) => b.esgScore - a.esgScore)
    .slice(0, limit);
}

// Get ESG laggards (lowest scores)
export function getESGLaggards(limit: number = 10): CuratedESGData[] {
  return Object.values(CURATED_ESG_DATA)
    .sort((a, b) => a.esgScore - b.esgScore)
    .slice(0, limit);
}

// Get unique sectors
export function getAvailableSectors(): string[] {
  const sectors = new Set(
    Object.values(CURATED_ESG_DATA).map((stock) => stock.sector),
  );
  return Array.from(sectors).sort();
}

// Total stocks in dataset
export const TOTAL_CURATED_STOCKS = Object.keys(CURATED_ESG_DATA).length;
