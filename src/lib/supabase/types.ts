export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      alerts: {
        Row: {
          condition: Json;
          created_at: string;
          id: string;
          portfolio_id: string;
          symbol: string;
          triggered: boolean;
          type: string;
        };
        Insert: {
          condition: Json;
          created_at?: string;
          id?: string;
          portfolio_id: string;
          symbol: string;
          triggered?: boolean;
          type: string;
        };
        Update: {
          condition?: Json;
          created_at?: string;
          id?: string;
          portfolio_id?: string;
          symbol?: string;
          triggered?: boolean;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "alerts_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
        ];
      };
      esg_cache: {
        Row: {
          data: Json;
          fetched_at: string;
          symbol: string;
        };
        Insert: {
          data: Json;
          fetched_at?: string;
          symbol: string;
        };
        Update: {
          data?: Json;
          fetched_at?: string;
          symbol?: string;
        };
        Relationships: [];
      };
      holdings: {
        Row: {
          avg_cost: number;
          created_at: string;
          id: string;
          name: string;
          portfolio_id: string;
          sector: string | null;
          shares: number;
          symbol: string;
        };
        Insert: {
          avg_cost: number;
          created_at?: string;
          id?: string;
          name: string;
          portfolio_id: string;
          sector?: string | null;
          shares: number;
          symbol: string;
        };
        Update: {
          avg_cost?: number;
          created_at?: string;
          id?: string;
          name?: string;
          portfolio_id?: string;
          sector?: string | null;
          shares?: number;
          symbol?: string;
        };
        Relationships: [
          {
            foreignKeyName: "holdings_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
        ];
      };
      portfolios: {
        Row: {
          created_at: string;
          currency: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          currency?: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          currency?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          executed_at: string;
          id: string;
          portfolio_id: string;
          price: number;
          shares: number;
          symbol: string;
          type: string;
        };
        Insert: {
          executed_at?: string;
          id?: string;
          portfolio_id: string;
          price: number;
          shares: number;
          symbol: string;
          type: string;
        };
        Update: {
          executed_at?: string;
          id?: string;
          portfolio_id?: string;
          price?: number;
          shares?: number;
          symbol?: string;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_portfolio_id_fkey";
            columns: ["portfolio_id"];
            isOneToOne: false;
            referencedRelation: "portfolios";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Helper types for each table
export type Portfolio = Database["public"]["Tables"]["portfolios"]["Row"];
export type PortfolioInsert =
  Database["public"]["Tables"]["portfolios"]["Insert"];
export type PortfolioUpdate =
  Database["public"]["Tables"]["portfolios"]["Update"];

export type Holding = Database["public"]["Tables"]["holdings"]["Row"];
export type HoldingInsert = Database["public"]["Tables"]["holdings"]["Insert"];
export type HoldingUpdate = Database["public"]["Tables"]["holdings"]["Update"];

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];

export type Alert = Database["public"]["Tables"]["alerts"]["Row"];
export type AlertInsert = Database["public"]["Tables"]["alerts"]["Insert"];
export type AlertUpdate = Database["public"]["Tables"]["alerts"]["Update"];

export type EsgCache = Database["public"]["Tables"]["esg_cache"]["Row"];
export type EsgCacheInsert =
  Database["public"]["Tables"]["esg_cache"]["Insert"];
export type EsgCacheUpdate =
  Database["public"]["Tables"]["esg_cache"]["Update"];
