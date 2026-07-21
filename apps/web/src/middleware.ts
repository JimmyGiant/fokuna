import { NextResponse, type NextRequest } from "next/server";

const protectedPrefixes = ["/app"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasDemoSession = Boolean(request.cookies.get("fokuna_demo_session")?.value);
  const hasBetterAuthSession = request.cookies
    .getAll()
    .some((cookie) => cookie.name.includes("session") || cookie.name.includes("better-auth"));

  if (!hasDemoSession && !hasBetterAuthSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
