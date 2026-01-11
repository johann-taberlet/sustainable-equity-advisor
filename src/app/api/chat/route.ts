import { NextRequest, NextResponse } from "next/server";
import { getMockResponse } from "@/lib/chat";
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

// Check if we should use mock responses
const USE_MOCK_LLM = process.env.USE_MOCK_LLM === "true";

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, history = [], holdings = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let responseMessage: string;
    let toolsUsed: string[] = [];

    if (USE_MOCK_LLM) {
      // Use mock responses for testing
      responseMessage = getMockResponse(message);
    } else {
      // Use real OpenRouter API
      const apiKey = process.env.OPENROUTER_API_KEY;

      if (!apiKey) {
        console.error("OPENROUTER_API_KEY is not set");
        // Fallback to mock if no API key
        responseMessage = getMockResponse(message);
      } else {
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
          responseMessage = result.content;
          toolsUsed = result.toolsUsed;
        } catch (error) {
          console.error("OpenRouter API error:", error);

          // Return user-friendly error message
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
              { status: 200 }
            );
          }

          // Fallback to mock response on error
          responseMessage = getMockResponse(message);
        }
      }
    }

    return NextResponse.json({
      message: responseMessage,
      role: "assistant",
      toolsUsed,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
