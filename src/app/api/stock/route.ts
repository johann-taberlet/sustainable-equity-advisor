import { NextRequest, NextResponse } from "next/server";
import { fetchStockQuote } from "@/lib/fmp";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json(
      { error: "Missing required parameter: symbol" },
      { status: 400 }
    );
  }

  try {
    const quote = await fetchStockQuote(symbol.toUpperCase());

    if (!quote) {
      return NextResponse.json(
        { error: `Stock not found: ${symbol}` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      symbol: quote.symbol,
      name: quote.name,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      currency: "USD", // FMP returns USD prices
      exchange: quote.exchange,
      marketCap: quote.marketCap,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return NextResponse.json(
      { error: "Failed to fetch stock quote" },
      { status: 500 }
    );
  }
}
