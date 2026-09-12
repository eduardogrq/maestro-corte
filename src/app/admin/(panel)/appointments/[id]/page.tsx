import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cancelAppointmentAction } from "@/actions/appointments"
import { SyncBadge } from "@/components/admin/sync-badge"
import { WhatsAppButton } from "@/components/admin/whatsapp-button"
import { Button } from "@/components/ui/button"
import {
  formatDayLong,
  formatPriceMxn,
  formatTimeRange,
  utcToWallClock,
} from "@/lib/datetime"
import { buildMapsUrl } from "@/lib/maps"
import { buildTelUrl, formatMxPhone } from "@/lib/phone"
import { findAppointmentById } from "@/server/appointments/repository"
import { requireSession } from "@/server/auth/dal"

export const metadata: Metadata = {
  title: "Cita",
}

export default async function AppointmentDetailPage({
  params,
}: PageProps<"/admin/appointments/[id]">) {
  await requireSession()

  const { id } = await params
  const appointment = await findAppointmentById(id)

  if (!appointment) {
    notFound()
  }

  const { date } = utcToWallClock(appointment.startsAt)
  const isCancelled = appointment.status === "cancelled"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin"
          className="text-sm text-muted transition-colors duration-200 hover:text-foreground"
        >
          ← Agenda
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-foreground">
          {appointment.clientName}
        </h1>
        {isCancelled && (
          <p className="mt-1 text-sm text-danger">Cita cancelada</p>
        )}
      </div>

      <dl className="flex flex-col gap-4 rounded-xl border border-border bg-surface/50 px-4 py-5">
        <div>
          <dt className="text-sm text-muted">Cuándo</dt>
          <dd className="text-base text-foreground">
            {formatDayLong(date)} · {formatTimeRange(appointment.startsAt, appointment.endsAt)}
          </dd>
        </div>

        <div>
          <dt className="text-sm text-muted">Servicio</dt>
          <dd className="text-base text-foreground">
            {appointment.serviceName} · {formatPriceMxn(appointment.priceMxn)}
          </dd>
        </div>

        <div>
          <dt className="text-sm text-muted">Teléfono</dt>
          <dd className="text-base">
            <a
              href={buildTelUrl(appointment.clientPhone)}
              className="text-accent underline underline-offset-4"
            >
              {formatMxPhone(appointment.clientPhone)}
            </a>
          </dd>
        </div>

        {appointment.address && (
          <div>
            <dt className="text-sm text-muted">Dirección</dt>
            <dd className="text-base">
              <a
                href={buildMapsUrl(appointment.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline underline-offset-4"
              >
                {appointment.address}
              </a>
            </dd>
          </div>
        )}

        {appointment.notes && (
          <div>
            <dt className="text-sm text-muted">Notas</dt>
            <dd className="whitespace-pre-line text-base text-foreground">
              {appointment.notes}
            </dd>
          </div>
        )}
      </dl>

      {!isCancelled && (
        <>
          <WhatsAppButton appointment={appointment} />
          {/* Hidden once cancelled: retrying a sync would put the event back on
              his calendar. */}
          <SyncBadge appointment={appointment} />
        </>
      )}

      {!isCancelled && (
        <div className="flex flex-col gap-3 border-t border-border pt-5">
          <Link href={`/admin/appointments/${appointment.id}/edit`}>
            <Button variant="secondary" className="w-full">
              Editar cita
            </Button>
          </Link>

          <form action={cancelAppointmentAction}>
            <input type="hidden" name="id" value={appointment.id} />
            <Button type="submit" variant="danger" className="w-full">
              Cancelar cita
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
