import "server-only"
import { createSign } from "node:crypto"
import { env } from "@/server/env"

const TOKEN_URL = "https://oauth2.googleapis.com/token"
const GRANT_TYPE = "urn:ietf:params:oauth:grant-type:jwt-bearer"

/**
 * Only `calendar.events`. Not `calendar`, which would also allow deleting the
 * barber's calendars — we are writing into his personal agenda, so the scope is
 * the narrowest one that can create an event.
 */
const SCOPE = "https://www.googleapis.com/auth/calendar.events"

const LIFETIME_SECONDS = 3600
/** Renew a minute early so a token never expires mid-request. */
const SKEW_SECONDS = 60

interface CachedToken {
  accessToken: string
  expiresAt: number
}

/**
 * Module scope survives across requests inside one warm lambda, which is the
 * only thing we want here: it saves a round trip to Google on most calls. A
 * cold start just mints a new token, so correctness never depends on the cache.
 */
let cached: CachedToken | null = null

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url")
}

function signedAssertion(): string {
  const issuedAt = Math.floor(Date.now() / 1000)

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))
  const payload = base64url(
    JSON.stringify({
      iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: issuedAt,
      exp: issuedAt + LIFETIME_SECONDS,
    })
  )

  const signature = createSign("RSA-SHA256")
    .update(`${header}.${payload}`)
    .sign(env.GOOGLE_PRIVATE_KEY)
    .toString("base64url")

  return `${header}.${payload}.${signature}`
}

export async function getAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)

  if (cached && cached.expiresAt > now + SKEW_SECONDS) {
    return cached.accessToken
  }

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: GRANT_TYPE,
      assertion: signedAssertion(),
    }),
    signal: AbortSignal.timeout(8_000),
    cache: "no-store",
  })

  if (!response.ok) {
    // The body carries Google's real reason (`invalid_grant` for a malformed
    // private key, for instance) and it is what makes this debuggable.
    throw new Error(
      `No se pudo obtener el token de Google (${response.status}): ${await response.text()}`
    )
  }

  const data: unknown = await response.json()

  if (
    typeof data !== "object" ||
    data === null ||
    typeof (data as { access_token?: unknown }).access_token !== "string"
  ) {
    throw new Error("Respuesta inesperada del token de Google")
  }

  const { access_token: accessToken, expires_in: expiresIn } = data as {
    access_token: string
    expires_in?: number
  }

  cached = {
    accessToken,
    expiresAt: now + (typeof expiresIn === "number" ? expiresIn : LIFETIME_SECONDS),
  }

  return accessToken
}
