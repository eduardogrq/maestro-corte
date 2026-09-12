import "server-only"
import { addDaysToDateString, wallClockToUtc } from "@/lib/datetime"
import type { BusyInterval } from "@/components/admin/appointment-form"
import { listAppointmentsBetween } from "./repository"

/**
 * How far ahead the form knows about occupied slots. Beyond this the chips all
 * look free — harmless, because `findOverlapping` in the service is the real
 * check and still warns on submit. This window just keeps the payload small.
 */
const HORIZON_DAYS = 60

/**
 * Occupied intervals as epoch milliseconds. Sending instants instead of
 * wall-clock strings means the form's overlap math needs no timezone handling
 * and works across midnight for free.
 */
export async function busyIntervalsFrom(
  fromDate: string,
  excludeId?: string
): Promise<BusyInterval[]> {
  const rows = await listAppointmentsBetween(
    wallClockToUtc(fromDate, "00:00"),
    wallClockToUtc(addDaysToDateString(fromDate, HORIZON_DAYS), "00:00")
  )

  return rows
    .filter((row) => row.status !== "cancelled" && row.id !== excludeId)
    .map((row) => ({
      startMs: row.startsAt.getTime(),
      endMs: row.endsAt.getTime(),
      clientName: row.clientName,
    }))
}

/** First slot of the day that no appointment overlaps, given a service duration. */
export function firstFreeSlot(
  slots: string[],
  date: string,
  durationMin: number,
  busy: BusyInterval[],
  notBefore?: Date
): string {
  for (const slot of slots) {
    const startMs = wallClockToUtc(date, slot).getTime()
    const endMs = startMs + durationMin * 60_000

    if (notBefore && startMs < notBefore.getTime()) continue

    const taken = busy.some(
      (interval) => startMs < interval.endMs && endMs > interval.startMs
    )

    if (!taken) return slot
  }

  return ""
}
