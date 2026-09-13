/**
 * Mexican phone numbers, normalized to the shape wa.me expects: country code
 * plus ten digits, no plus sign, no separators. Matches the format already
 * used in `business.whatsapp.number`.
 */
const MX_COUNTRY_CODE = "52"
const NATIONAL_DIGITS = 10

/**
 * Accepts whatever the barber types — "5512345678", "55 1234 5678",
 * "+52 55 1234 5678", "521 55 1234 5678" — and returns "52##########".
 * Returns null when it can't be a Mexican number, so the caller can show
 * an error instead of building a WhatsApp link to nowhere.
 */
export function normalizeMxPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "")

  if (digits.length === NATIONAL_DIGITS) {
    return `${MX_COUNTRY_CODE}${digits}`
  }

  if (digits.length === 12 && digits.startsWith(MX_COUNTRY_CODE)) {
    return digits
  }

  // Legacy mobile format: Mexico used to insert a "1" after the country code.
  if (digits.length === 13 && digits.startsWith(`${MX_COUNTRY_CODE}1`)) {
    return `${MX_COUNTRY_CODE}${digits.slice(3)}`
  }

  return null
}

/** "525512345678" → "55 1234 5678", for reading it back on screen. */
export function formatMxPhone(normalized: string): string {
  const national = normalized.slice(MX_COUNTRY_CODE.length)

  if (national.length !== NATIONAL_DIGITS) return normalized

  return `${national.slice(0, 2)} ${national.slice(2, 6)} ${national.slice(6)}`
}

/** Tel link for one-tap calling from the agenda. */
export function buildTelUrl(normalized: string): string {
  return `tel:+${normalized}`
}

/**
 * Opens the conversation with no text prefilled — for tapping a client's number
 * to keep talking, where a canned message would only be in the way.
 */
export function buildWhatsAppChatUrl(normalized: string): string {
  return `https://wa.me/${normalized}`
}

export function buildWhatsAppUrl(normalized: string, message: string): string {
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}
