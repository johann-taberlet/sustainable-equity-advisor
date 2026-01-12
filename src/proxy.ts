import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const VALID_TOKEN = process.env.DEMO_ACCESS_TOKEN || "pictet-2026";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL;

// Send email notification when someone visits with valid token
async function notifyVisit(request: NextRequest) {
  if (!RESEND_API_KEY || !NOTIFICATION_EMAIL) return;

  const userAgent = request.headers.get("user-agent") || "Unknown";
  const referer = request.headers.get("referer") || "Direct link";
  const timestamp = new Date().toLocaleString("en-CH", {
    timeZone: "Europe/Zurich",
    dateStyle: "full",
    timeStyle: "short",
  });

  // Parse user agent for readable device info
  const isMobile = /Mobile|Android|iPhone/i.test(userAgent);
  const browser =
    userAgent.match(/(Chrome|Safari|Firefox|Edge|Opera)/i)?.[0] || "Unknown";
  const device = isMobile ? "Mobile" : "Desktop";

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio Demo <onboarding@resend.dev>",
        to: NOTIFICATION_EMAIL,
        subject: "Someone viewed your portfolio demo!",
        html: `
          <h2>New Visitor Alert</h2>
          <p>Someone just accessed your sustainable equity advisor demo.</p>
          <table style="border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px; color: #666;">Time</td><td style="padding: 8px; font-weight: bold;">${timestamp}</td></tr>
            <tr><td style="padding: 8px; color: #666;">Device</td><td style="padding: 8px;">${device} (${browser})</td></tr>
            <tr><td style="padding: 8px; color: #666;">Referrer</td><td style="padding: 8px;">${referer}</td></tr>
          </table>
          <p style="margin-top: 24px; color: #666; font-size: 12px;">This notification was sent because a valid access token was used.</p>
        `,
      }),
    });
  } catch (error) {
    console.error("Failed to send visit notification:", error);
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip middleware for API routes, static files, and the private page
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/private") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for token in URL or cookie
  const tokenFromUrl = searchParams.get("token");
  const tokenFromCookie = request.cookies.get("demo_token")?.value;

  // If token provided in URL, it MUST be valid
  if (tokenFromUrl !== null) {
    if (tokenFromUrl === VALID_TOKEN) {
      // Only notify if this is a NEW session (no valid cookie yet)
      if (tokenFromCookie !== VALID_TOKEN) {
        await notifyVisit(request);
      }

      const response = NextResponse.next();
      response.cookies.set("demo_token", VALID_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return response;
    }
    // Invalid token in URL - redirect to private page
    return NextResponse.redirect(new URL("/private", request.url));
  }

  // No token in URL - check cookie
  if (tokenFromCookie === VALID_TOKEN) {
    return NextResponse.next();
  }

  // No valid token - redirect to private page
  return NextResponse.redirect(new URL("/private", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
