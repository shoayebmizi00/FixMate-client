import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPrefixes = ["/admin", "/customer", "/technician", "/profile"];

function isProtectedPath(pathname: string) {
  if (pathname === "/dashboard") return true;

  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Keep the old singular /service/... links working.
  if (pathname === "/service" || pathname.startsWith("/service/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/services${pathname.slice("/service".length)}`;

    return NextResponse.redirect(url, 308);
  }

  // Optimistic check only: the cookie is not validated against MongoDB here.
  // Pages and route handlers still call requireRole/requireSession for the
  // real authorization check. Do not redirect /signin or /signup from here:
  // a stale cookie would loop through /dashboard.
  const hasSession = Boolean(getSessionCookie(request));

  if (!hasSession && isProtectedPath(pathname)) {
    const signInUrl = new URL("/signin", request.url);
    signInUrl.searchParams.set("next", `${pathname}${search}`);

    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/service/:path*",
    "/dashboard",
    "/admin/:path*",
    "/customer/:path*",
    "/technician/:path*",
    "/profile/:path*",
  ],
};
