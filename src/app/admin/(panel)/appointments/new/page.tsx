import type { Metadata } from "next"
import Link from "next/link"
import { createAppointmentAction } from "@/actions/appointments"
import { AppointmentForm } from "@/components/admin/appointment-form"
import { bookableServices } from "@/data/services"
import { slotsForDate, todayInMexicoCity } from "@/lib/datetime"
import { busyIntervalsFrom, firstFreeSlot } from "@/server/appointments/busy"
import { requireSession } from "@/server/auth/dal"

export const metadata: Metadata = {
  title: "Nueva cita",
}

export default async function NewAppointmentPage() {
  await requireSession()

  const today = todayInMexicoCity()
  const busy = await busyIntervalsFrom(today)

  // Defaults that match how the panel is actually used: booking today, for the
  // next free gap, with the most common service already picked.
  const defaultService = bookableServices[0]
  const defaultTime = firstFreeSlot(
    slotsForDate(today),
    today,
    defaultService.durationMin,
    busy,
    new Date()
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin"
          className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
        >
          ← Agenda
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-foreground">Nueva cita</h1>
      </div>

      <AppointmentForm
        action={createAppointmentAction}
        services={bookableServices}
        busy={busy}
        today={today}
        minDate={today}
        submitLabel="Guardar cita"
        initialValues={{
          clientName: "",
          clientPhone: "",
          serviceId: defaultService.id,
          date: today,
          time: defaultTime,
          address: "",
          notes: "",
        }}
      />
    </div>
  )
}
