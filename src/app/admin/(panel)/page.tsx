import Link from "next/link"
import { AppointmentCard } from "@/components/admin/appointment-card"
import { DateNav } from "@/components/admin/date-nav"
import { Button } from "@/components/ui/button"
import {
  addDaysToDateString,
  formatPriceMxn,
  todayInMexicoCity,
  wallClockToUtc,
} from "@/lib/datetime"
import { listAppointmentsBetween } from "@/server/appointments/repository"
import { requireSession } from "@/server/auth/dal"

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export default async function AgendaPage({
  searchParams,
}: PageProps<"/admin">) {
  await requireSession()

  const { date: raw } = await searchParams
  // A hand-edited or stale `?date=` falls back to today instead of erroring.
  const date =
    typeof raw === "string" && DATE_PATTERN.test(raw) ? raw : todayInMexicoCity()

  const appointments = await listAppointmentsBetween(
    wallClockToUtc(date, "00:00"),
    wallClockToUtc(addDaysToDateString(date, 1), "00:00")
  )

  const active = appointments.filter(
    (appointment) => appointment.status !== "cancelled"
  )
  const total = active.reduce((sum, appointment) => sum + appointment.priceMxn, 0)

  return (
    <div className="flex flex-col gap-6">
      <DateNav date={date} />

      <Link href="/admin/appointments/new" className="block">
        <Button size="lg" className="w-full">
          Nueva cita
        </Button>
      </Link>

      {appointments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-10 text-center text-base text-muted">
          Sin citas este día.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>

          <p className="text-sm text-muted">
            {active.length} {active.length === 1 ? "cita" : "citas"} ·{" "}
            {formatPriceMxn(total)}
          </p>
        </>
      )}
    </div>
  )
}
