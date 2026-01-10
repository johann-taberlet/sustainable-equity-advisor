import { NextRequest, NextResponse } from "next/server";
import { getMockResponse } from "@/lib/chat";

interface ChatRequestBody {
  message: string;
  history?: Array<{ role: string; content: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, history = [] } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Use mock responses for now (real OpenRouter integration to come)
    const responseMessage = getMockResponse(message);

    return NextResponse.json({
      message: responseMessage,
      role: "assistant",
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
