// middleware.ts runs before every matching request — before any page, layout
// or route handler. It's the right place for a cheap gate like "is there a
// session?", and because it sits in front of the cache, pages behind it can
// still be prerendered and served statically.

import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const signedIn = request.cookies.has(SESSION_COOKIE);
  const onLogin = pathname === "/login";

  if (!signedIn && !onLogin) {
    // APIs answer with a status code; pages send the person to sign in and
    // remember where they were heading.
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    if (pathname !== "/") login.searchParams.set("from", pathname + search);
    return NextResponse.redirect(login);
  }

  if (signedIn && onLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Skip Next's own assets, the generated metadata files and anything in /public.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|opengraph-image|robots.txt|sitemap.xml|images/).*)",
  ],
};
