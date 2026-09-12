import "server-only"
import { findBookableService } from "@/data/services"
import {
  addMinutes,
  endsAfterClosing,
  formatTime,
  formatTimeRange,
  hoursForDate,
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

  const startsAt = wallClockToUtc(input.date, input.time)

  return {
    serviceName: service.name,
    priceMxn: service.priceMxn,
    durationMin: service.durationMin,
    startsAt,
    endsAt: addMinutes(startsAt, service.durationMin),
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

  const { open, close } = hoursForDate(input.date)

  if (input.time < open || input.time >= close) {
    warnings.push(`Fuera del horario de ese día (${open} a ${close}).`)
  } else if (endsAfterClosing(input.date, input.time, slot.durationMin)) {
    warnings.push(`La cita termina después del cierre (${close}).`)
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
    if (!other.address || !input.address) continue
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
    serviceName: slot.serviceName,
    priceMxn: slot.priceMxn,
    durationMin: slot.durationMin,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    address: input.address ?? null,
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
  | { kind: "warnings"; warnings: string[] }
  | { kind: "updated"; appointment: Appointment }

export async function editAppointment(
  id: string,
  input: AppointmentInput,
  force: boolean
): Promise<EditResult> {
  const slot = resolveSlot(input)

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
    serviceName: slot.serviceName,
    priceMxn: slot.priceMxn,
    durationMin: slot.durationMin,
    startsAt: slot.startsAt,
    endsAt: slot.endsAt,
    address: input.address ?? null,
    notes: input.notes ?? null,
  })

  if (!appointment) {
    throw new Error("La cita ya no existe.")
  }

  await syncToCalendar(appointment)

  return { kind: "updated", appointment }
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
