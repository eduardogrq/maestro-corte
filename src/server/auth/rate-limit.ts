import "server-only"
import { createHash } from "node:crypto"
import { and, count, eq, gte, lt } from "drizzle-orm"
import { db } from "@/server/db"
import { loginAttempts } from "@/server/db/schema"
import { env } from "@/server/env"

const WINDOW_MINUTES = 15
const MAX_ATTEMPTS = 5

/**
 * Counted in Postgres rather than in memory: serverless functions run in
 * multiple instances and scale to zero, so an in-process Map would reset
 * constantly and enforce nothing.
 */
function hashIp(ip: string): string {
  return createHash("sha256").update(`${ip}:${env.SESSION_SECRET}`).digest("hex")
}

function windowStart(): Date {
  return new Date(Date.now() - WINDOW_MINUTES * 60_000)
}

/**
 * Fails open on database errors, on purpose: rate limiting is defense in depth
 * behind a high-entropy password, and locking the barber out of his own agenda
 * because Neon hiccuped would be worse than the risk it prevents.
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  try {
    const [row] = await db
      .select({ attempts: count() })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.ipHash, hashIp(ip)),
          gte(loginAttempts.createdAt, windowStart())
        )
      )

    return (row?.attempts ?? 0) >= MAX_ATTEMPTS
  } catch {
    return false
  }
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  try {
    await db.insert(loginAttempts).values({ ipHash: hashIp(ip) })
    // Opportunistic cleanup: keeps the table from growing without a cron job.
    await db.delete(loginAttempts).where(lt(loginAttempts.createdAt, windowStart()))
  } catch {
    // Nothing to do — see the note on isRateLimited.
  }
}

export async function clearAttempts(ip: string): Promise<void> {
  try {
    await db.delete(loginAttempts).where(eq(loginAttempts.ipHash, hashIp(ip)))
  } catch {
    // Nothing to do — see the note on isRateLimited.
  }
}

export const LOGIN_WINDOW_MINUTES = WINDOW_MINUTES
