import { business } from "@/data/business"
import { formatPriceMxn } from "@/lib/datetime"
import { buildIcsFile } from "@/lib/ics"
import {
  buildPublicAppointmentUrl,
  readPublicToken,
} from "@/server/appointments/public-link"
import { findAppointmentById } from "@/server/appointments/repository"

/** Same host the public link uses, so the UID is stable and unambiguous. */
const UID_DOMAIN = new URL(business.url).host

/** Never cached: the file has to reflect the appointment as it stands right now. */
export const dynamic = "force-dynamic"

function notFound(): Response {
  return new Response("No encontrado", { status: 404 })
}

/**
 * The `.ics` the client downloads from their own appointment page. Guarded by
 * the same signed token as the page, so this adds no new way in.
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/cita/[token]/calendario.ics">
) {
  const { token } = await ctx.params
  const appointmentId = readPublicToken(token)

  if (!appointmentId) {
    return notFound()
  }

  const appointment = await findAppointmentById(appointmentId)

  // A cancelled appointment has nothing to add. Removing it from a calendar it
  // already reached would need METHOD:CANCEL and a matching UID on the client's
  // side, which is not something we can rely on — the page tells them instead.
  if (!appointment || appointment.status === "cancelled") {
    return notFound()
  }

  const descriptionLines = [
    `${appointment.serviceName} con ${business.owner}.`,
    `Costo: ${formatPriceMxn(appointment.priceMxn)}`,
    "",
    `Ver tu cita: ${buildPublicAppointmentUrl(appointment.id)}`,
    `WhatsApp: +${business.whatsapp.number}`,
  ]

  const file = buildIcsFile({
    uid: `${appointment.id}@${UID_DOMAIN}`,
    summary: `${appointment.serviceName} con ${business.owner}`,
    description: descriptionLines.join("\n"),
    location: appointment.address ?? undefined,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
  })

  return new Response(file, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // `inline` on purpose: iPhone opens the event straight in Calendar, while
      // Android downloads it either way because it can't render the type.
      "Content-Disposition": 'inline; filename="cita-maestro-corte.ics"',
      "Cache-Control": "no-store",
    },
  })
}
