/**
 * ESG Score Normalization Utilities
 * Handles different rating providers and formats to normalize to 0-100 scale
 */

/**
 * Letter grade to numeric score mapping
 * Used by MSCI, S&P Global, and other providers
 */
const letterGradeToScore: Record<string, number> = {
  // MSCI ESG ratings (CCC to AAA)
  AAA: 95,
  AA: 85,
  A: 75,
  BBB: 65,
  BB: 55,
  B: 45,
  CCC: 35,
  // S&P Global style
  "A+": 90,
  "A-": 70,
  "B+": 60,
  "B-": 40,
  "C+": 30,
  "C-": 20,
  C: 25,
  D: 15,
  F: 5,
  // Simple grades
  EXCELLENT: 95,
  GOOD: 75,
  AVERAGE: 55,
  POOR: 35,
  VERY_POOR: 15,
};

/**
 * Provider-specific score ranges for normalization
 */
interface ProviderRange {
  min: number;
  max: number;
}

const providerRanges: Record<string, ProviderRange> = {
  // FMP uses 0-100
  FMP: { min: 0, max: 100 },
  // Sustainalytics uses 0-100 (risk score, lower is better)
  SUSTAINALYTICS: { min: 0, max: 100 },
  // Refinitiv uses 0-100
  REFINITIV: { min: 0, max: 100 },
  // Bloomberg uses 0-100
  BLOOMBERG: { min: 0, max: 100 },
  // MSCI uses letter grades (handled separately)
  MSCI: { min: 0, max: 100 },
  // S&P Global uses 0-100
  SP_GLOBAL: { min: 0, max: 100 },
};

/**
 * Normalize a numeric score to 0-100 range
 */
export function normalizeNumericScore(
  score: number | undefined | null,
  provider: string = "FMP",
): number {
  if (score === undefined || score === null || Number.isNaN(score)) {
    return 0;
  }

  const range = providerRanges[provider] || providerRanges.FMP;

  // Special handling for Sustainalytics (lower is better)
  if (provider === "SUSTAINALYTICS") {
    // Invert the score (0 risk = 100 ESG score)
    const invertedScore = range.max - score;
    return clampScore(invertedScore);
  }

  // Normalize to 0-100 if provider uses different range
  if (range.min !== 0 || range.max !== 100) {
    const normalized = ((score - range.min) / (range.max - range.min)) * 100;
    return clampScore(normalized);
  }

  return clampScore(score);
}

/**
 * Convert letter grade to numeric score
 */
export function normalizeLetterGrade(grade: string | undefined | null): number {
  if (!grade) {
    return 0;
  }

  const upperGrade = grade.toUpperCase().trim();
  const score = letterGradeToScore[upperGrade];

  if (score !== undefined) {
    return score;
  }

  // Try to parse partial matches
  for (const [key, value] of Object.entries(letterGradeToScore)) {
    if (upperGrade.includes(key) || key.includes(upperGrade)) {
      return value;
    }
  }

  return 0;
}

/**
 * Clamp score to 0-100 range
 */
function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Normalize any ESG score (numeric or letter grade)
 */
export function normalizeESGScore(
  score: number | string | undefined | null,
  provider: string = "FMP",
): number {
  if (score === undefined || score === null) {
    return 0;
  }

  // Handle string scores (letter grades)
  if (typeof score === "string") {
    // Try to parse as number first
    const numericValue = Number.parseFloat(score);
    if (!Number.isNaN(numericValue)) {
      return normalizeNumericScore(numericValue, provider);
    }
    // Otherwise treat as letter grade
    return normalizeLetterGrade(score);
  }

  // Handle numeric scores
  return normalizeNumericScore(score, provider);
}

/**
 * Calculate weighted average ESG score
 */
export function calculateWeightedESGScore(
  scores: Array<{ score: number; weight: number }>,
): number {
  if (scores.length === 0) {
    return 0;
  }

  const totalWeight = scores.reduce((sum, s) => sum + s.weight, 0);
  if (totalWeight === 0) {
    return 0;
  }

  const weightedSum = scores.reduce((sum, s) => sum + s.score * s.weight, 0);
  return clampScore(weightedSum / totalWeight);
}

/**
 * Calculate aggregate ESG score from E, S, G components
 * Default weights: E=33%, S=33%, G=34%
 */
export function calculateAggregateESGScore(
  environmental: number,
  social: number,
  governance: number,
  weights: { e: number; s: number; g: number } = { e: 0.33, s: 0.33, g: 0.34 },
): number {
  return calculateWeightedESGScore([
    { score: environmental, weight: weights.e },
    { score: social, weight: weights.s },
    { score: governance, weight: weights.g },
  ]);
}

/**
 * Get ESG rating label based on score
 */
export function getESGRatingLabel(score: number): string {
  if (score >= 90) return "Leader";
  if (score >= 80) return "Strong";
  if (score >= 60) return "Average";
  if (score >= 40) return "Below Average";
  return "Laggard";
}

/**
 * Get color indicator based on ESG score
 */
export function getESGColorIndicator(
  score: number,
): "green" | "yellow" | "orange" | "red" {
  if (score >= 80) return "green";
  if (score >= 60) return "yellow";
  if (score >= 40) return "orange";
  return "red";
}
