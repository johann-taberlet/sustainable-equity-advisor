import { NextRequest, NextResponse } from "next/server";
import {
  callOpenRouter,
  type OpenRouterMessage,
  type PortfolioHolding,
} from "@/lib/chat/openrouter";

interface ChatRequestBody {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  holdings?: PortfolioHolding[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, history = [], holdings = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    // Require OpenRouter API key
    const apiKey = process.env.OPENROUTER_API_KEY;

    // Debug: log key presence and first few chars
    console.log("API Key present:", !!apiKey);
    console.log("API Key prefix:", apiKey?.substring(0, 10) + "...");

    if (!apiKey) {
      console.error("OPENROUTER_API_KEY is not set");
      return NextResponse.json(
        {
          message:
            "AI service is not configured. Please set OPENROUTER_API_KEY.",
          role: "assistant",
          error: "config_error",
        },
        { status: 200 },
      );
    }

    try {
      // Build conversation history for context
      const messages: OpenRouterMessage[] = [
        ...history.map((h) => ({
          role: h.role as "user" | "assistant",
          content: h.content,
        })),
        { role: "user" as const, content: message },
      ];

      const result = await callOpenRouter(messages, apiKey, holdings);

      return NextResponse.json({
        message: result.content,
        role: "assistant",
        toolsUsed: result.toolsUsed,
      });
    } catch (error) {
      console.error("OpenRouter API error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";

      // For rate limits, return specific error
      if (errorMessage.includes("Rate limit")) {
        return NextResponse.json(
          {
            message:
              "I'm currently experiencing high demand. Please try again in a moment.",
            role: "assistant",
            error: "rate_limit",
          },
          { status: 200 },
        );
      }

      // Return error without falling back to mock
      return NextResponse.json(
        {
          message:
            "I encountered an error processing your request. Please try again.",
          role: "assistant",
          error: "api_error",
        },
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
