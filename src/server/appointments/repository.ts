import "server-only"
import { and, asc, eq, gt, gte, lt, lte, ne } from "drizzle-orm"
import { db } from "@/server/db"
import { appointments, type Appointment, type NewAppointment } from "@/server/db/schema"

/**
 * Inserts, or returns the row that already exists for this `clientToken`.
 *
 * `ON CONFLICT DO NOTHING` returns zero rows when the token was already used,
 * so a second submit ends up reading the first appointment instead of creating
 * a twin. Double-submit is solved in the database, not by trusting the button
 * to stay disabled on a flaky connection.
 */
export async function insertAppointment(
  values: NewAppointment
): Promise<Appointment> {
  const [inserted] = await db
    .insert(appointments)
    .values(values)
    .onConflictDoNothing({ target: appointments.clientToken })
    .returning()

  if (inserted) {
    return inserted
  }

  const existing = await findByClientToken(values.clientToken)

  if (!existing) {
    throw new Error("No se pudo guardar la cita.")
  }

  return existing
}

export async function findByClientToken(
  clientToken: string
): Promise<Appointment | undefined> {
  const [row] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.clientToken, clientToken))
    .limit(1)

  return row
}

export async function findAppointmentById(
  id: string
): Promise<Appointment | undefined> {
  const [row] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1)

  return row
}

/** Appointments in `[from, to)`, cancelled ones included so the day reads honestly. */
export async function listAppointmentsBetween(
  from: Date,
  to: Date
): Promise<Appointment[]> {
  return db
    .select()
    .from(appointments)
    .where(and(gte(appointments.startsAt, from), lt(appointments.startsAt, to)))
    .orderBy(asc(appointments.startsAt))
}

/**
 * Half-open interval overlap: `startsA < endB AND endA > startB`. Two
 * appointments that merely touch (one ends exactly when the next starts) do not
 * overlap, which is the common case of back-to-back haircuts.
 *
 * `excludeId` is for editing: an appointment must not conflict with itself.
 */
export async function findOverlapping(
  startsAt: Date,
  endsAt: Date,
  excludeId?: string
): Promise<Appointment[]> {
  const conditions = [
    ne(appointments.status, "cancelled"),
    lt(appointments.startsAt, endsAt),
    gt(appointments.endsAt, startsAt),
  ]

  if (excludeId) {
    conditions.push(ne(appointments.id, excludeId))
  }

  return db
    .select()
    .from(appointments)
    .where(and(...conditions))
    .orderBy(asc(appointments.startsAt))
}

/**
 * Appointments close enough in time that getting between the two addresses
 * matters. Traffic in CDMX is the reason this exists: two back-to-back
 * appointments in different neighbourhoods is a problem the calendar cannot see.
 */
export async function findNearby(
  startsAt: Date,
  endsAt: Date,
  bufferMinutes: number,
  excludeId?: string
): Promise<Appointment[]> {
  const bufferMs = bufferMinutes * 60_000
  const windowStart = new Date(startsAt.getTime() - bufferMs)
  const windowEnd = new Date(endsAt.getTime() + bufferMs)

  const conditions = [
    ne(appointments.status, "cancelled"),
    lte(appointments.startsAt, windowEnd),
    gte(appointments.endsAt, windowStart),
  ]

  if (excludeId) {
    conditions.push(ne(appointments.id, excludeId))
  }

  return db
    .select()
    .from(appointments)
    .where(and(...conditions))
    .orderBy(asc(appointments.startsAt))
}

/** The next appointment from now on, used to preselect a sensible time. */
export async function findNextAppointmentAfter(
  instant: Date
): Promise<Appointment | undefined> {
  const [row] = await db
    .select()
    .from(appointments)
    .where(and(ne(appointments.status, "cancelled"), gte(appointments.endsAt, instant)))
    .orderBy(asc(appointments.startsAt))
    .limit(1)

  return row
}

export async function updateAppointment(
  id: string,
  values: Partial<
    Pick<
      Appointment,
      | "clientName"
      | "clientPhone"
      | "serviceId"
      | "groupId"
      | "withBeard"
      | "firstVisit"
      | "serviceName"
      | "priceMxn"
      | "durationMin"
      | "startsAt"
      | "endsAt"
      | "address"
      | "notes"
      | "status"
    >
  >
): Promise<Appointment | undefined> {
  const [row] = await db
    .update(appointments)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(appointments.id, id))
    .returning()

  return row
}

export async function markCalendarSynced(
  id: string,
  calendarEventId: string
): Promise<void> {
  await db
    .update(appointments)
    .set({
      calendarEventId,
      calendarSync: "synced",
      calendarError: null,
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, id))
}

export async function markCalendarFailed(id: string, message: string): Promise<void> {
  await db
    .update(appointments)
    .set({
      calendarSync: "failed",
      // Truncated: this column is for a human to read, not to store a stack trace.
      calendarError: message.slice(0, 500),
      updatedAt: new Date(),
    })
    .where(eq(appointments.id, id))
}

export async function cancelAppointment(id: string): Promise<Appointment | undefined> {
  const [row] = await db
    .update(appointments)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(appointments.id, id))
    .returning()

  return row
}
