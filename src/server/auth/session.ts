import "server-only"
import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { SESSION_COOKIE_NAME } from "@/lib/auth-cookie"
import { env } from "@/server/env"

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 días

/**
 * Single shared password, so the session carries no identity — only an expiry.
 * Format: base64url(payload).hmac, signed with SESSION_SECRET.
 */
interface SessionPayload {
  exp: number
}

function sign(payload: string): string {
  return createHmac("sha256", env.SESSION_SECRET).update(payload).digest("base64url")
}

/**
 * Constant-time comparison over fixed-length digests. Hashing first means the
 * comparison never leaks the length of the expected value.
 */
function secretsMatch(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest()
  const digestB = createHash("sha256").update(b).digest()

  return timingSafeEqual(digestA, digestB)
}

export function isValidAdminPassword(candidate: string): boolean {
  return secretsMatch(candidate, env.ADMIN_PASSWORD)
}

function createSessionToken(): string {
  const payload: SessionPayload = { exp: Date.now() + MAX_AGE_SECONDS * 1000 }
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url")

  return `${encoded}.${sign(encoded)}`
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false

  const [encoded, signature] = token.split(".")
  if (!encoded || !signature) return false
  if (!secretsMatch(signature, sign(encoded))) return false

  try {
    const payload: unknown = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8")
    )

    if (typeof payload !== "object" || payload === null) return false

    const { exp } = payload as Partial<SessionPayload>

    return typeof exp === "number" && Date.now() < exp
  } catch {
    // Tampered or truncated payload.
    return false
  }
}

/** Only callable from a Server Action or Route Handler. */
export async function startSession(): Promise<void> {
  const store = await cookies()

  store.set(SESSION_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    // Off on localhost, where there is no HTTPS.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  })
}

/** Only callable from a Server Action or Route Handler. */
export async function endSession(): Promise<void> {
  const store = await cookies()
  store.delete(SESSION_COOKIE_NAME)
}

export async function readSessionCookie(): Promise<string | undefined> {
  const store = await cookies()

  return store.get(SESSION_COOKIE_NAME)?.value
}
