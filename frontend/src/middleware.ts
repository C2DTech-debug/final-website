import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side guard for the admin area. The real authorization happens on the
 * API (JWT + role middleware); this only blocks unauthenticated visitors from
 * even receiving the admin page shell. Logged-in users have the httpOnly
 * `refreshToken` cookie (path "/"), which is validated again client-side via
 * /auth/me before any admin UI renders.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (refreshToken) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*"],
};
