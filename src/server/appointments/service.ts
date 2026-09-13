import "server-only"
import { findBookableService, resolveServiceTotals } from "@/data/services"
import {
  addMinutes,
  bookingWindowForTime,
  endsAfter,
  formatTime,
  formatTimeRange,
  todayInMexicoCity,
  wallClockToUtc,
} from "@/lib/datetime"
import { formatMxPhone } from "@/lib/phone"
import {
  cancelCalendarEvent,
  createCalendarEvent,
  updateCalendarEvent,
} from "@/server/calendar/events"
import type { Appointment } from "@/server/db/schema"
import * as repository from "./repository"
import type { AppointmentInput } from "./schemas"

/** Travel time in CDMX is real; two appointments this close in different places is worth a warning. */
const TRAVEL_BUFFER_MINUTES = 30

/**
 * How far into the past a start time may still be accepted.
 *
 * Not zero, and that matters: he taps the slot that starts right now and then
 * spends a few minutes typing a name, a phone and an address. Rejecting that
 * submit would throw away everything he wrote, standing in a client's doorway.
 * Long enough to cover filling the form, short enough that yesterday or an hour
 * ago never gets through.
 */
const PAST_GRACE_MINUTES = 15

function startsInThePast(startsAt: Date): boolean {
  return startsAt.getTime() < Date.now() - PAST_GRACE_MINUTES * 60_000
}

interface ResolvedSlot {
  serviceName: string
  priceMxn: number
  durationMin: number
  startsAt: Date
  endsAt: Date
}

function resolveSlot(input: AppointmentInput): ResolvedSlot {
  const service = findBookableService(input.serviceId)

  if (!service) {
    // The zod schema already refuses unknown ids; this is the type narrowing.
    throw new Error(`Servicio desconocido: ${input.serviceId}`)
  }

  const totals = resolveServiceTotals(service, {
    groupId: input.groupId,
    withBeard: input.withBeard,
    firstVisit: input.firstVisit,
  })

  const startsAt = wallClockToUtc(input.date, input.time)

  return {
    serviceName: totals.name,
    priceMxn: totals.priceMxn,
    durationMin: totals.durationMin,
    startsAt,
    endsAt: addMinutes(startsAt, totals.durationMin),
  }
}

/**
 * Everything here is a *warning*, never a block. The barber knows his own day
 * better than this software does: he may well want two appointments in the same
 * building, or one at 8am for a regular client. We tell him what we see and let
 * him decide.
 */
async function collectWarnings(
  input: AppointmentInput,
  slot: ResolvedSlot,
  excludeId?: string
): Promise<string[]> {
  const warnings: string[] = []

  if (input.date < todayInMexicoCity()) {
    warnings.push("La fecha ya pasó.")
  }

  // Judged against the extended hours when he picked an unusual time on purpose,
  // against the published ones otherwise. See `bookingWindowForTime`.
  const { open, close } = bookingWindowForTime(input.date, input.time)

  if (input.time < open || input.time >= close) {
    warnings.push(`Fuera de horario, incluso el extendido (${open} a ${close}).`)
  } else if (endsAfter(input.time, slot.durationMin, close)) {
    warnings.push(`La cita termina después de las ${close}.`)
  }

  const overlapping = await repository.findOverlapping(
    slot.startsAt,
    slot.endsAt,
    excludeId
  )

  for (const other of overlapping) {
    warnings.push(
      `Se cruza con ${other.clientName} (${formatTimeRange(other.startsAt, other.endsAt)}).`
    )
  }

  // Only flag travel for appointments that don't already overlap — otherwise the
  // barber reads the same conflict twice.
  const overlappingIds = new Set(overlapping.map((other) => other.id))
  const nearby = await repository.findNearby(
    slot.startsAt,
    slot.endsAt,
    TRAVEL_BUFFER_MINUTES,
    excludeId
  )

  for (const other of nearby) {
    if (overlappingIds.has(other.id)) continue
    // `other.address` can still be null: appointments saved before the address
    // became required. Without both addresses there is no travel to compare.
    if (!other.address) continue
    if (other.address.trim().toLowerCase() === input.address.trim().toLowerCase()) continue

    warnings.push(
      `${formatTime(other.startsAt)} con ${other.clientName} en otra dirección: revisa el traslado.`
    )
  }

  return warnings
}

function calendarSummary(appointment: Appointment): string {
  return `${appointment.serviceName} — ${appointment.clientName}`
}

function calendarDescription(appointment: Appointment): string {
  const lines = [
    `Cliente: ${appointment.clientName}`,
    `Teléfono: ${formatMxPhone(appointment.clientPhone)}`,
    `Servicio: ${appointment.serviceName}`,
  ]

  if (appointment.notes) {
    lines.push("", `Notas: ${appointment.notes}`)
  }

  return lines.join("\n")
}

/**
 * Pushes the appointment to Calendar and records the outcome. Never throws:
 * the appointment is already safe in Postgres, and a Google outage must not
 * turn into a lost booking or an error screen. A failure leaves a badge and a
 * retry button in the panel.
 *
 * The event id is derived from the appointment id, so retrying is idempotent.
 */
export async function syncToCalendar(appointment: Appointment): Promise<void> {
  const payload = {
    appointmentId: appointment.id,
    summary: calendarSummary(appointment),
    description: calendarDescription(appointment),
    location: appointment.address ?? undefined,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
  }

  try {
    // PATCH only when we already own an event id from our own database — never
    // by searching his calendar. That is what keeps his personal events safe.
    if (appointment.calendarEventId) {
      await updateCalendarEvent(appointment.calendarEventId, payload)
      await repository.markCalendarSynced(appointment.id, appointment.calendarEventId)
      return
    }

    const eventId = await createCalendarEvent(payload)
    await repository.markCalendarSynced(appointment.id, eventId)
  } catch (error) {
    await repository.markCalendarFailed(
      appointment.id,
      error instanceof Error ? error.message : "Error desconocido"
    )
  }
}

export type CreateResult =
  /** A real refusal, not a warning: no "guardar de todos modos" for these. */
  | { kind: "rejected"; reason: string }
  | { kind: "warnings"; warnings: string[] }
  | { kind: "created"; appointment: Appointment }

/**
 * Order matters: Postgres first, Calendar second. If Google is down or the
 * function dies mid-request, the appointment still exists and shows up in the
 * panel as "no sincronizada" — the opposite order could lose it entirely.
 */
export async function createAppointment(
  input: AppointmentInput,
  clientToken: string,
  force: boolean
): Promise<CreateResult> {
  const slot = resolveSlot(input)

  // The one hard stop in the whole flow, and `force` does not open it: a brand
  // new appointment that starts in the past is never what he meant. The panel
  // already greys those slots out, so reaching here means a stale screen or a
  // mistyped date.
  if (startsInThePast(slot.startsAt)) {
    return { kind: "rejected", reason: "Esa hora ya pasó. Elige una más adelante." }
  }

  if (!force) {
    const warnings = await collectWarnings(input, slot)

    if (warnings.length > 0) {
      // Nothing written yet — the barber gets to confirm first.
      return { kind: "warnings", warnings }
    }
  }

  const appointment = await repository.insertAppointment({
    id: crypto.randomUUID(),
    clientToken,
    clientName: input.clientName,
    clientPhone: input.clientPhone,
    serviceId: input.serviceId,
    groupId: input.groupId,
    withBeard: input.withBeard,
    firstVisit: input.firstVisit,
    serviceName: slot.serviceName,
    priceMxn: slot.priceMxn,
    durationMin: slot.durationMin,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    address: input.address,
    notes: input.notes ?? null,
  })

  // A second submit lands on the already-synced row; re-syncing it would be a
  // pointless call to Google.
  if (appointment.calendarSync === "pending") {
    await syncToCalendar(appointment)
  }

  return { kind: "created", appointment }
}

export type EditResult =
  | { kind: "rejected"; reason: string }
  | { kind: "warnings"; warnings: string[] }
  | { kind: "updated"; appointment: Appointment }

export async function editAppointment(
  id: string,
  input: AppointmentInput,
  force: boolean
): Promise<EditResult> {
  const existing = await repository.findAppointmentById(id)

  if (!existing) {
    throw new Error("La cita ya no existe.")
  }

  const slot = resolveSlot(input)

  // Correcting an appointment that already happened is legitimate — the address
  // was wrong, or it really was at eleven and not at ten. Dragging a *future*
  // appointment into the past is not.
  if (startsInThePast(slot.startsAt) && !startsInThePast(existing.startsAt)) {
    return { kind: "rejected", reason: "Esa hora ya pasó. Elige una más adelante." }
  }

  if (!force) {
    const warnings = await collectWarnings(input, slot, id)

    if (warnings.length > 0) {
      return { kind: "warnings", warnings }
    }
  }

  const appointment = await repository.updateAppointment(id, {
    clientName: input.clientName,
    clientPhone: input.clientPhone,
    serviceId: input.serviceId,
    groupId: input.groupId,
    withBeard: input.withBeard,
    firstVisit: input.firstVisit,
    serviceName: slot.serviceName,
    priceMxn: slot.priceMxn,
    durationMin: slot.durationMin,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    address: input.address,
    notes: input.notes ?? null,
  })

  if (!appointment) {
    throw new Error("La cita ya no existe.")
  }

  await syncToCalendar(appointment)

  return { kind: "updated", appointment }
}

/**
 * Deletes the row for good. Only cancelled appointments qualify, and that is a
 * safety rule, not a formality: cancelling is what removes the event from the
 * barber's calendar, and this row holds the only copy of that event id. Delete a
 * live appointment and the event stays in his personal calendar forever, with no
 * way for us to ever find it again.
 *
 * Order is the reverse of creating — Calendar first, Postgres second. If Google
 * is unreachable nothing is deleted: a leftover row is recoverable, a ghost event
 * is not.
 */
export async function deleteAppointment(id: string): Promise<void> {
  const appointment = await repository.findAppointmentById(id)

  // Already gone, likely a double tap. Nothing to do and nothing to report.
  if (!appointment) {
    return
  }

  if (appointment.status !== "cancelled") {
    throw new Error("Cancela la cita antes de eliminarla.")
  }

  // The cancel could have failed to reach Google. The PATCH is idempotent, so
  // running it again is free, and letting it throw here stops the delete.
  if (appointment.calendarEventId && appointment.calendarSync !== "synced") {
    await cancelCalendarEvent(appointment.calendarEventId)
  }

  await repository.deleteAppointment(id)
}

export async function cancelAppointment(id: string): Promise<Appointment> {
  const appointment = await repository.cancelAppointment(id)

  if (!appointment) {
    throw new Error("La cita ya no existe.")
  }

  // An appointment that never reached Calendar has nothing to cancel there.
  if (appointment.calendarEventId) {
    try {
      await cancelCalendarEvent(appointment.calendarEventId)
    } catch (error) {
      await repository.markCalendarFailed(
        appointment.id,
        error instanceof Error ? error.message : "Error desconocido"
      )
    }
  }

  return appointment
}
