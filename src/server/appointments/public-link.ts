import "server-only"
import { createHmac, timingSafeEqual } from "node:crypto"
import { business } from "@/data/business"
import { env } from "@/server/env"

/** 128 bits of signature, base64url: unguessable, still short enough for a chat. */
const SIGNATURE_LENGTH = 22

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * The link the client receives *is* the credential, so it has to be impossible
 * to guess and impossible to forge. `<uuid>.<hmac>` does both with the id the
 * appointment already has: no extra column, no migration, and it works for
 * appointments that were saved before this existed.
 *
 * The key is derived from SESSION_SECRET rather than being SESSION_SECRET, so a
 * client link can never be reshaped into an admin session — and this needs no
 * seventh environment variable. Rotating SESSION_SECRET invalidates every link
 * (and every open session) at once.
 */
const linkKey = createHmac("sha256", env.SESSION_SECRET)
  .update("maestro-corte/public-appointment-link/v1")
  .digest()

function sign(appointmentId: string): string {
  return createHmac("sha256", linkKey)
    .update(appointmentId)
    .digest("base64url")
    .slice(0, SIGNATURE_LENGTH)
}

export function buildPublicAppointmentUrl(appointmentId: string): string {
  return `${business.url}/cita/${appointmentId}.${sign(appointmentId)}`
}

/**
 * Returns the appointment id only when the signature checks out, so the caller
 * can treat anything else as a 404 without ever touching the database.
 */
export function readPublicToken(token: string): string | null {
  const separator = token.lastIndexOf(".")

  if (separator === -1) return null

  const appointmentId = token.slice(0, separator)
  const signature = token.slice(separator + 1)

  // Both checks also guarantee the equal length `timingSafeEqual` requires.
  if (!UUID_PATTERN.test(appointmentId)) return null
  if (signature.length !== SIGNATURE_LENGTH) return null

  const matches = timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(sign(appointmentId))
  )

  return matches ? appointmentId : null
}
