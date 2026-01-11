import { supabase } from "./client";
import type {
  Alert,
  AlertInsert,
  EsgCache,
  EsgCacheInsert,
  Holding,
  HoldingInsert,
  Portfolio,
  PortfolioInsert,
  Transaction,
  TransactionInsert,
} from "./types";

// Portfolio queries
export async function getPortfolio(id: string): Promise<Portfolio | null> {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getPortfolios(): Promise<Portfolio[]> {
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createPortfolio(
  portfolio: PortfolioInsert,
): Promise<Portfolio> {
  const { data, error } = await supabase
    .from("portfolios")
    .insert(portfolio)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Holdings queries
export async function getHoldings(portfolioId: string): Promise<Holding[]> {
  const { data, error } = await supabase
    .from("holdings")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("symbol");

  if (error) throw error;
  return data || [];
}

export async function addHolding(holding: HoldingInsert): Promise<Holding> {
  const { data, error } = await supabase
    .from("holdings")
    .insert(holding)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHolding(
  id: string,
  updates: Partial<Holding>,
): Promise<Holding> {
  const { data, error } = await supabase
    .from("holdings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeHolding(id: string): Promise<void> {
  const { error } = await supabase.from("holdings").delete().eq("id", id);

  if (error) throw error;
}

// Transaction queries
export async function getTransactions(
  portfolioId: string,
): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("executed_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addTransaction(
  transaction: TransactionInsert,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from("transactions")
    .insert(transaction)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Alert queries
export async function getAlerts(portfolioId: string): Promise<Alert[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createAlert(alert: AlertInsert): Promise<Alert> {
  const { data, error } = await supabase
    .from("alerts")
    .insert(alert)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase.from("alerts").delete().eq("id", id);

  if (error) throw error;
}

export async function updateAlert(
  id: string,
  updates: Partial<Alert>,
): Promise<Alert> {
  const { data, error } = await supabase
    .from("alerts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ESG cache queries
export async function getCachedESG(symbol: string): Promise<EsgCache | null> {
  const { data, error } = await supabase
    .from("esg_cache")
    .select("*")
    .eq("symbol", symbol)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function cacheESG(cache: EsgCacheInsert): Promise<EsgCache> {
  const { data, error } = await supabase
    .from("esg_cache")
    .upsert(cache, { onConflict: "symbol" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getCachedESGBatch(
  symbols: string[],
): Promise<EsgCache[]> {
  const { data, error } = await supabase
    .from("esg_cache")
    .select("*")
    .in("symbol", symbols);

  if (error) throw error;
  return data || [];
}
