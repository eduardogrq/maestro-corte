import type { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"
import { business } from "@/data/business"
import {
  formatDayLong,
  formatPriceMxn,
  formatTimeRange,
  todayInMexicoCity,
  utcToWallClock,
} from "@/lib/datetime"
import { buildWhatsAppUrl } from "@/lib/phone"
import { buildMapsUrl } from "@/lib/maps"
import { readPublicToken } from "@/server/appointments/public-link"
import { findAppointmentById } from "@/server/appointments/repository"

/**
 * The link is unguessable, but WhatsApp fetches it to build a chat preview, so
 * the title is the one thing that may end up visible to whoever sees the message:
 * it carries no client data. `noindex` on top of that, in case a link is ever
 * pasted somewhere public.
 */
export const metadata: Metadata = {
  title: "Tu cita",
  robots: { index: false, follow: false, nocache: true },
}

/**
 * Always rendered fresh. The whole point of this page is that it does not lie
 * after Diego moves or cancels the appointment, which a cached copy would.
 */
export const dynamic = "force-dynamic"

/**
 * Outside the `(site)` route group on purpose: that layout's header links to
 * landing anchors that do nothing here, and its "Agendar cita" CTA makes no
 * sense for someone who already has one.
 */
export default async function PublicAppointmentPage({
  params,
}: PageProps<"/cita/[token]">) {
  const { token } = await params
  const appointmentId = readPublicToken(token)

  // A tampered or invented signature is a 404, never a 403: the page must not
  // reveal whether an appointment exists behind it.
  if (!appointmentId) {
    notFound()
  }

  const appointment = await findAppointmentById(appointmentId)

  if (!appointment) {
    notFound()
  }

  const { date } = utcToWallClock(appointment.startsAt)
  const isCancelled = appointment.status === "cancelled"
  // Compared as Mexico City calendar days, not instants: an appointment earlier
  // today still reads as today's, which is what the client expects.
  const isPast = date < todayInMexicoCity()
  const firstName = appointment.clientName.trim().split(/\s+/)[0]

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col gap-8 px-5 py-10">
      <Image
        src="/images/maestro-corte-full-logo.png"
        alt={business.name}
        width={1672}
        height={284}
        className="h-auto w-40"
        priority
      />

      <div>
        <h1 className="font-serif text-3xl text-foreground">Hola {firstName}</h1>
        <p className="mt-2 text-base text-muted">
          {isCancelled
            ? "Esta cita quedó cancelada."
            : isPast
              ? "Estos fueron los datos de tu cita."
              : "Estos son los datos de tu cita."}
        </p>
      </div>

      <dl
        className={`flex flex-col gap-5 rounded-2xl border px-5 py-6 ${
          isCancelled
            ? "border-border bg-surface/50 opacity-70"
            : "border-border bg-surface/50"
        }`}
      >
        <div>
          <dt className="text-sm text-muted">Cuándo</dt>
          <dd className="text-lg text-foreground">
            {formatDayLong(date)}
            <span className="block text-base text-muted">
              {formatTimeRange(appointment.startsAt, appointment.endsAt)}
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-sm text-muted">Servicio</dt>
          <dd className="text-base text-foreground">{appointment.serviceName}</dd>
        </div>

        <div>
          <dt className="text-sm text-muted">Costo</dt>
          <dd className="text-base text-foreground">
            {formatPriceMxn(appointment.priceMxn)}
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
      </dl>

      <div className="flex flex-col gap-3">
        {/* Only while there is still something to remember. A plain `.ics`
            download, so it works on Android and iPhone without signing in. */}
        {!isCancelled && !isPast && (
          <a
            href={`/cita/${token}/calendario.ics`}
            className="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-foreground px-6 text-base font-medium text-background transition-colors duration-200 hover:bg-foreground/90"
          >
            Agregar a mi calendario
          </a>
        )}

        <a
          href={buildWhatsAppUrl(
            business.whatsapp.number,
            `Hola ${business.owner}, te escribo sobre mi cita del ${formatDayLong(date)}.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className={
            isCancelled || isPast
              ? "inline-flex min-h-14 w-full items-center justify-center rounded-full bg-foreground px-6 text-base font-medium text-background transition-colors duration-200 hover:bg-foreground/90"
              : "inline-flex min-h-14 w-full items-center justify-center rounded-full border border-border bg-background px-6 text-base font-medium text-foreground transition-colors duration-200 hover:bg-surface"
          }
        >
          {isCancelled || isPast ? "Escribir por WhatsApp" : "Cambiar o cancelar"}
        </a>

        <p className="text-center text-sm text-muted">
          Esta página se actualiza sola si la cita cambia.
        </p>
      </div>
    </div>
  )
}
