import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  cancelAppointmentAction,
  deleteAppointmentAction,
} from "@/actions/appointments"
import { ConfirmDialog } from "@/components/admin/confirm-dialog"
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
import { buildWhatsAppChatUrl, formatMxPhone } from "@/lib/phone"
import { buildPublicAppointmentUrl } from "@/server/appointments/public-link"
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
  const publicUrl = buildPublicAppointmentUrl(appointment.id)

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
            {/* WhatsApp instead of `tel:`: the panel lives on his phone and the
                conversation with the client is already there. */}
            <a
              href={buildWhatsAppChatUrl(appointment.clientPhone)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline underline-offset-4"
            >
              {formatMxPhone(appointment.clientPhone)}
            </a>
            <span className="ml-2 text-sm text-muted">· WhatsApp</span>
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
          <WhatsAppButton appointment={appointment} publicUrl={publicUrl} />
          {/* Hidden once cancelled: retrying a sync would put the event back on
              his calendar. */}
          <SyncBadge appointment={appointment} />
        </>
      )}

      {/* This page is also where saving lands, so the way out has to be a button,
          not just the small link up top. Shown for cancelled appointments too. */}
      <Link href="/admin" className="block">
        <Button variant="secondary" className="w-full">
          Volver a la agenda
        </Button>
      </Link>

      <div className="flex flex-col gap-3 border-t border-border pt-5">
        {isCancelled ? (
          // Deleting is only offered here, on an already cancelled appointment:
          // cancelling is what took the event out of his calendar, and this row
          // holds the only copy of that event id.
          <ConfirmDialog
            action={deleteAppointmentAction}
            appointmentId={appointment.id}
            triggerLabel="Eliminar cita"
            title="¿Eliminar esta cita?"
            description="Se borra el registro para siempre, con el precio y las notas que quedaron guardados. No se puede deshacer."
            confirmLabel="Sí, eliminar"
            pendingLabel="Eliminando…"
          />
        ) : (
          <>
            <Link href={`/admin/appointments/${appointment.id}/edit`}>
              <Button variant="secondary" className="w-full">
                Editar cita
              </Button>
            </Link>

            <ConfirmDialog
              action={cancelAppointmentAction}
              appointmentId={appointment.id}
              triggerLabel="Cancelar cita"
              title={`¿Cancelar la cita de ${appointment.clientName}?`}
              description={`${
                appointment.calendarSync === "synced"
                  ? "Se quita de tu calendario de Google y no se puede deshacer."
                  : "No se puede deshacer."
              } El cliente no recibe ningún aviso: si ya quedaste con él, avísale por WhatsApp.`}
              confirmLabel="Sí, cancelar la cita"
              pendingLabel="Cancelando…"
            />
          </>
        )}
      </div>
    </div>
  )
}
