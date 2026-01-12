import { type NextRequest, NextResponse } from "next/server";
import { type ESGData, fetchESGDataBatch } from "@/lib/fmp";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam) {
    return NextResponse.json(
      { error: "Missing required parameter: symbols" },
      { status: 400 },
    );
  }

  const symbols = symbolsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: "No valid symbols provided" },
      { status: 400 },
    );
  }

  // Limit batch size to prevent abuse
  if (symbols.length > 20) {
    return NextResponse.json(
      { error: "Maximum 20 symbols per request" },
      { status: 400 },
    );
  }

  try {
    const esgMap = await fetchESGDataBatch(symbols);
    const results: Record<string, ESGData | null> = {};

    for (const symbol of symbols) {
      results[symbol] = esgMap.get(symbol) || null;
    }

    return NextResponse.json({
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching ESG data:", error);
    return NextResponse.json(
      { error: "Failed to fetch ESG data" },
      { status: 500 },
    );
  }
}
