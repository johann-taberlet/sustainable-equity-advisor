import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const VALID_TOKEN = process.env.DEMO_ACCESS_TOKEN || "pictet-2026";

export function proxy(request: NextRequest) {
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
