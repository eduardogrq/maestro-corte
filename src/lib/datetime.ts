import { business } from "@/data/business"

/**
 * Every date in this app is stored as UTC and displayed in Mexico City time,
 * regardless of the device's clock. If the barber travels or his phone has the
 * wrong timezone, the panel must still show the hour he agreed with the client.
 */
export const TIME_ZONE = "America/Mexico_City"
export const LOCALE = "es-MX"

/** Granularity of the slot grid in the booking form. */
export const SLOT_MINUTES = 30

type DateParts = Record<Intl.DateTimeFormatPartTypes, string>

function partsIn(instant: Date, timeZone: string): DateParts {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant)

  const parts = {} as DateParts
  for (const part of formatted) {
    if (part.type !== "literal") parts[part.type] = part.value
  }

  return parts
}

/**
 * How far Mexico City is from UTC at a given instant, in milliseconds.
 * Derived from Intl rather than hardcoded: Mexico dropped DST in 2022, but
 * hardcoding UTC-6 would silently break if that ever changes again.
 */
function zoneOffsetMs(instant: Date): number {
  const parts = partsIn(instant, TIME_ZONE)

  const asIfUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    // Intl can render midnight as hour "24" in some runtimes.
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  )

  return asIfUtc - instant.getTime()
}

/**
 * Turns a wall-clock date and time as typed in the form ("2026-09-15", "16:30")
 * into the exact instant it represents in Mexico City.
 *
 * Two passes: the first estimates the offset, the second corrects it in case
 * the estimate landed on the other side of a DST transition.
 */
export function wallClockToUtc(date: string, time: string): Date {
  const naive = Date.parse(`${date}T${time}:00Z`)

  if (Number.isNaN(naive)) {
    throw new Error(`Fecha u hora inválida: "${date}" "${time}"`)
  }

  let instant = naive - zoneOffsetMs(new Date(naive))
  instant = naive - zoneOffsetMs(new Date(instant))

  return new Date(instant)
}

/** Inverse of `wallClockToUtc`, for pre-filling the edit form. */
export function utcToWallClock(instant: Date): { date: string; time: string } {
  const parts = partsIn(instant, TIME_ZONE)
  const hour = String(Number(parts.hour) % 24).padStart(2, "0")

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${hour}:${parts.minute}`,
  }
}

/** Today's date in Mexico City as "YYYY-MM-DD" — not the device's today. */
export function todayInMexicoCity(): string {
  return utcToWallClock(new Date()).date
}

/**
 * Interprets a "YYYY-MM-DD" string as a stable instant for formatting and
 * weekday math. Noon UTC is safe for any offset within ±12h, so the calendar
 * date never shifts.
 */
function dateStringToNoonUtc(date: string): Date {
  return new Date(`${date}T12:00:00Z`)
}

/** Day of week for a "YYYY-MM-DD" string. 0 = Sunday. */
export function dayOfWeek(date: string): number {
  return dateStringToNoonUtc(date).getUTCDay()
}

export function addDaysToDateString(date: string, days: number): string {
  const shifted = dateStringToNoonUtc(date)
  shifted.setUTCDate(shifted.getUTCDate() + days)

  return shifted.toISOString().slice(0, 10)
}

export function addMinutes(instant: Date, minutes: number): Date {
  return new Date(instant.getTime() + minutes * 60_000)
}

// ── Formatting ───────────────────────────────────────────────────────────────
// Always with an explicit timeZone and locale. Never bare toLocaleString().

/** "16:30" → "4:30 p.m.". Pure string math, no timezone involved. */
export function formatWallClockTime(time: string): string {
  const [rawHour, minute] = time.split(":")
  const hour = Number(rawHour)
  const period = hour < 12 ? "a.m." : "p.m."
  const hour12 = hour % 12 === 0 ? 12 : hour % 12

  return `${hour12}:${minute} ${period}`
}

export function formatTime(instant: Date): string {
  return formatWallClockTime(utcToWallClock(instant).time)
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} – ${formatTime(end)}`
}

/** "lunes 15 de septiembre" */
export function formatDayLong(date: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dateStringToNoonUtc(date))
}

/** "15 sept 2026" */
export function formatDateShort(date: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    timeZone: TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateStringToNoonUtc(date))
}

export function formatPriceMxn(priceMxn: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceMxn)
}

// ── Business hours ───────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(":").map(Number)
  return hour * 60 + minute
}

function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

export interface BookingWindow {
  open: string
  close: string
}

/** The hours published on the site for that weekday. */
export function hoursForDate(date: string): BookingWindow {
  // bookingHours covers all 7 days, so this is always defined.
  return business.bookingHours[dayOfWeek(date)]
}

/**
 * Which hours a chosen time should be judged against. A time inside the
 * published hours is judged against those, so "termina después del cierre" keeps
 * working as before. Anything earlier or later can only have been picked by
 * deliberately unlocking the extended range in the form, so judging it against
 * the published hours would be telling him something he already knows.
 */
export function bookingWindowForTime(date: string, time: string): BookingWindow {
  const published = hoursForDate(date)

  if (time >= published.open && time < published.close) {
    return published
  }

  return business.extendedBookingHours
}

/**
 * Bookable start times for a date, every SLOT_MINUTES from opening until the
 * last slot that still starts before closing.
 *
 * `extended` widens the list to the earliest and latest he is ever willing to
 * work, for the special hours he agrees to now and then.
 */
export function slotsForDate(date: string, extended = false): string[] {
  const { open, close } = extended
    ? business.extendedBookingHours
    : hoursForDate(date)
  const slots: string[] = []

  for (
    let minutes = timeToMinutes(open);
    minutes <= timeToMinutes(close) - SLOT_MINUTES;
    minutes += SLOT_MINUTES
  ) {
    slots.push(minutesToTime(minutes))
  }

  return slots
}

/** True when the appointment would run past `close`. Warning, not a block. */
export function endsAfter(
  time: string,
  durationMin: number,
  close: string
): boolean {
  return timeToMinutes(time) + durationMin > timeToMinutes(close)
}
