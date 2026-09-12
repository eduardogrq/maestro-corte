import "server-only"
import { TIME_ZONE } from "@/lib/datetime"
import { getAccessToken } from "./token"
import { env } from "@/server/env"

const API_BASE = "https://www.googleapis.com/calendar/v3/calendars"
const REQUEST_TIMEOUT_MS = 8_000

/** Google truncates silently past ~1024; we cut first so what we send is what we mean. */
const MAX_LOCATION_LENGTH = 1_000
const MAX_DESCRIPTION_LENGTH = 4_000

/**
 * Stamped on every event we create. It is the marker that lets a human (or a
 * future cleanup script) tell our events apart from the barber's personal ones,
 * since we write into his primary calendar.
 */
const APP_MARKER = "maestro-corte"

export interface CalendarEventInput {
  /** Appointment UUID. The Calendar event id is derived from it. */
  appointmentId: string
  summary: string
  description?: string
  location?: string
  startsAt: Date
  endsAt: Date
}

/**
 * Calendar requires custom ids to be base32hex — characters `0-9` and `a-v`,
 * at least 5 chars. A UUID without dashes is plain hex, a strict subset, so
 * this is always valid. Deriving it from the appointment id is what makes a
 * retry idempotent instead of creating a second event.
 */
export function calendarEventIdFor(appointmentId: string): string {
  return `mc${appointmentId.replace(/-/g, "").toLowerCase()}`
}

function encodedCalendarId(): string {
  return encodeURIComponent(env.GOOGLE_CALENDAR_ID)
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value
}

async function calendarFetch(
  path: string,
  init: { method: string; body?: unknown }
): Promise<Response> {
  const accessToken = await getAccessToken()

  return fetch(`${API_BASE}/${encodedCalendarId()}${path}`, {
    method: init.method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    cache: "no-store",
  })
}

function eventBody(input: CalendarEventInput) {
  return {
    id: calendarEventIdFor(input.appointmentId),
    summary: input.summary,
    description: input.description
      ? truncate(input.description, MAX_DESCRIPTION_LENGTH)
      : undefined,
    location: input.location ? truncate(input.location, MAX_LOCATION_LENGTH) : undefined,
    // `timeZone` is declared even though the timestamp is a UTC instant: it is
    // what makes the event render as CDMX time in every client.
    start: { dateTime: input.startsAt.toISOString(), timeZone: TIME_ZONE },
    end: { dateTime: input.endsAt.toISOString(), timeZone: TIME_ZONE },
    // The barber's own reminder settings apply, instead of us imposing ours.
    reminders: { useDefault: true },
    extendedProperties: { private: { app: APP_MARKER } },
  }
}

async function describeFailure(response: Response): Promise<string> {
  const body = await response.text().catch(() => "")
  return truncate(`HTTP ${response.status} ${body}`.trim(), 500)
}

/**
 * Creates the event. A 409 means an event with this id already exists, which
 * for us is success: the id is derived from the appointment, so the only way to
 * hit it is a retry of this very appointment.
 */
export async function createCalendarEvent(
  input: CalendarEventInput
): Promise<string> {
  const response = await calendarFetch("/events", {
    method: "POST",
    body: eventBody(input),
  })

  if (response.ok || response.status === 409) {
    return calendarEventIdFor(input.appointmentId)
  }

  throw new Error(await describeFailure(response))
}

/**
 * PATCH, never PUT: PUT would clear any field the barber edited by hand in
 * Calendar. `eventId` must come from our own database — never from searching
 * the calendar — so a bug can't touch one of his personal events.
 */
export async function updateCalendarEvent(
  eventId: string,
  input: CalendarEventInput
): Promise<void> {
  // `id` is dropped: it is not a patchable field, and the event we are patching
  // is identified by the URL.
  const { id, ...patch } = eventBody(input)
  void id

  const response = await calendarFetch(`/events/${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    body: patch,
  })

  if (!response.ok) {
    throw new Error(await describeFailure(response))
  }
}

/**
 * Cancels by setting `status`, never DELETE. Calendar does not reliably allow
 * reusing the id of a deleted event, and our ids are derived from the
 * appointment — deleting would make a later re-sync of that appointment
 * permanently impossible.
 *
 * A 404 or 410 counts as done: the event is already gone from his calendar.
 */
export async function cancelCalendarEvent(eventId: string): Promise<void> {
  const response = await calendarFetch(`/events/${encodeURIComponent(eventId)}`, {
    method: "PATCH",
    body: { status: "cancelled" },
  })

  if (response.ok || response.status === 404 || response.status === 410) {
    return
  }

  throw new Error(await describeFailure(response))
}
