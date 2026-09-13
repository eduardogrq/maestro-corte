import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  editAppointmentAction,
  searchClientsAction,
} from "@/actions/appointments"
import { AppointmentForm } from "@/components/admin/appointment-form"
import { bookableServices, toBookableServiceId } from "@/data/services"
import { todayInMexicoCity, utcToWallClock } from "@/lib/datetime"
import { busyIntervalsFrom } from "@/server/appointments/busy"
import { findAppointmentById } from "@/server/appointments/repository"
import { requireSession } from "@/server/auth/dal"

export const metadata: Metadata = {
  title: "Editar cita",
}

export default async function EditAppointmentPage({
  params,
}: PageProps<"/admin/appointments/[id]/edit">) {
  await requireSession()

  const { id } = await params
  const appointment = await findAppointmentById(id)

  if (!appointment) {
    notFound()
  }

  const today = todayInMexicoCity()
  const { date, time } = utcToWallClock(appointment.startsAt)

  // The window starts at whichever is earlier, so editing a past appointment
  // still shows its own day. Excluding itself keeps its slot selectable instead
  // of appearing as a conflict with itself.
  const busy = await busyIntervalsFrom(date < today ? date : today, appointment.id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/admin/appointments/${appointment.id}`}
          className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
        >
          ← Cita
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-foreground">Editar cita</h1>
      </div>

      <AppointmentForm
        action={editAppointmentAction}
        searchClients={searchClientsAction}
        appointmentId={appointment.id}
        services={bookableServices}
        busy={busy}
        today={today}
        serverNowMs={new Date().getTime()}
        // Not `today`: editing an appointment from last week must not be blocked
        // by the date input's own minimum.
        minDate={date < today ? date : today}
        submitLabel="Guardar cambios"
        initialValues={{
          clientName: appointment.clientName,
          clientPhone: appointment.clientPhone,
          // An appointment booked as "Fade" predates the unified haircut; without
          // this the select would open with nothing selected.
          serviceId: toBookableServiceId(appointment.serviceId),
          groupId: appointment.groupId,
          withBeard: appointment.withBeard ? "1" : "0",
          firstVisit: appointment.firstVisit ? "1" : "0",
          date,
          time,
          address: appointment.address ?? "",
          notes: appointment.notes ?? "",
        }}
      />
    </div>
  )
}
