import { business } from "@/data/business"
import { formatPriceMxn } from "@/lib/datetime"
import { toIcsInstant, type CalendarFileEvent } from "@/lib/ics"

/**
 * The one description of the appointment as a calendar event, shared by the
 * `.ics` file and the Google Calendar link so both say exactly the same thing.
 */
export interface AppointmentCalendarData {
  id: string
  serviceName: string
  priceMxn: number
  startsAt: Date
  endsAt: Date
  address: string | null
}

/** Keeps the event UID unambiguous and tied to this site. */
const UID_DOMAIN = new URL(business.url).host

function buildSummary(appointment: AppointmentCalendarData): string {
  return `${appointment.serviceName} con ${business.owner}`
}

function buildDescription(
  appointment: AppointmentCalendarData,
  publicUrl: string
): string {
  return [
    `${appointment.serviceName} con ${business.owner}.`,
    `Costo: ${formatPriceMxn(appointment.priceMxn)}`,
    "",
    `Ver tu cita: ${publicUrl}`,
    `WhatsApp: +${business.whatsapp.number}`,
  ].join("\n")
}

export function buildAppointmentCalendarEvent(
  appointment: AppointmentCalendarData,
  publicUrl: string
): CalendarFileEvent {
  return {
    // Derived from the appointment id, so downloading twice updates the event
    // instead of leaving the client with two.
    uid: `${appointment.id}@${UID_DOMAIN}`,
    summary: buildSummary(appointment),
    description: buildDescription(appointment, publicUrl),
    location: appointment.address ?? undefined,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
  }
}

/**
 * Google's own "add event" form, prefilled. This is a plain navigation, which is
 * why it survives WhatsApp's in-app browser — where a file download often does
 * not. No API, no key, no cost.
 */
export function buildGoogleCalendarUrl(
  appointment: AppointmentCalendarData,
  publicUrl: string
): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: buildSummary(appointment),
    dates: `${toIcsInstant(appointment.startsAt)}/${toIcsInstant(appointment.endsAt)}`,
    details: buildDescription(appointment, publicUrl),
  })

  if (appointment.address) {
    params.set("location", appointment.address)
  }

  return `https://calendar.google.com/calendar/render?${params}`
}
