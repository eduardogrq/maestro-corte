import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { readSessionCookie, verifySessionToken } from "./session"

/**
 * The real authorization check. `proxy.ts` only looks at whether a cookie is
 * present, which the Next docs explicitly call an optimistic check — so every
 * admin page and every Server Action must call this before touching data.
 *
 * Wrapped in `cache()` so a single render verifies the signature once.
 */
export const isAuthenticated = cache(async (): Promise<boolean> => {
  return verifySessionToken(await readSessionCookie())
})

export async function requireSession(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/admin/login")
  }
}
