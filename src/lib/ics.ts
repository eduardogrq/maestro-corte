/**
 * Minimal iCalendar (RFC 5545) writer, for the "agregar a mi calendario" link
 * the client gets. An `.ics` file is the only option that works on both Android
 * and iPhone without asking the client to sign in anywhere.
 */

export interface CalendarFileEvent {
  /** Globally unique and *stable*: re-downloading must update, not duplicate. */
  uid: string
  summary: string
  description?: string
  location?: string
  startsAt: Date
  endsAt: Date
}

/** "2026-09-15T16:30:00.000Z" → "20260915T163000Z". UTC, so no VTIMEZONE needed. */
function toIcsInstant(instant: Date): string {
  return `${instant.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`
}

/** Commas, semicolons and newlines are structural in ICS and have to be escaped. */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
}

/**
 * Lines are limited to 75 *octets*, continued with a leading space. Counted in
 * UTF-8 bytes and split between code points, so an address with an accent or an
 * emoji in the notes can't be cut in half.
 */
function foldLine(line: string): string {
  const encoder = new TextEncoder()
  const chunks: string[] = []
  let current = ""
  let bytes = 0

  for (const char of line) {
    const size = encoder.encode(char).length
    // The continuation space itself counts against the 75.
    const limit = chunks.length === 0 ? 75 : 74

    if (bytes + size > limit) {
      chunks.push(current)
      current = ""
      bytes = 0
    }

    current += char
    bytes += size
  }

  chunks.push(current)

  return chunks.join("\r\n ")
}

export function buildIcsFile(event: CalendarFileEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maestro Corte//Citas//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${toIcsInstant(new Date())}`,
    `DTSTART:${toIcsInstant(event.startsAt)}`,
    `DTEND:${toIcsInstant(event.endsAt)}`,
    `SUMMARY:${escapeText(event.summary)}`,
  ]

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`)
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`)
  }

  lines.push("STATUS:CONFIRMED", "END:VEVENT", "END:VCALENDAR")

  // CRLF is required by the spec, and some calendar apps do enforce it.
  return `${lines.map(foldLine).join("\r\n")}\r\n`
}
