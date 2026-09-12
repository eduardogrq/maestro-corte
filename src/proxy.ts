import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookie"

/**
 * Optimistic check only: does a session cookie exist? The signature is never
 * verified here, because Proxy runs before (and separately from) render code.
 * The real check lives in `src/server/auth/dal.ts`, called by every admin page
 * and Server Action. A forged cookie gets past this file and dies there.
 *
 * Purpose here is purely UX: redirect instantly instead of rendering a page
 * that would bounce anyway.
 */
export function proxy(request: NextRequest) {
  // The login route is left alone on purpose. Bouncing it to /admin just because
  // a cookie exists creates an infinite loop with an expired or forged cookie:
  // proxy sends it to /admin, the DAL sends it back here, forever. The login
  // page runs the real check itself and redirects an actually-valid session.
  if (request.nextUrl.pathname === "/admin/login") {
    return NextResponse.next()
  }

  if (!request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/admin/:path*",
}
