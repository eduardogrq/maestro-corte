import { buildAppointmentCalendarEvent } from "@/lib/appointment-calendar"
import { buildIcsFile } from "@/lib/ics"
import {
  buildPublicAppointmentUrl,
  readPublicToken,
} from "@/server/appointments/public-link"
import { findAppointmentById } from "@/server/appointments/repository"

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

  const file = buildIcsFile(
    buildAppointmentCalendarEvent(
      appointment,
      buildPublicAppointmentUrl(appointment.id)
    )
  )

  return new Response(file, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      // `attachment`, never `inline`: with `inline` WhatsApp's in-app browser
      // renders the raw VCALENDAR text on screen instead of handing the file to
      // the Calendar app.
      "Content-Disposition": 'attachment; filename="cita-maestro-corte.ics"',
      "Cache-Control": "no-store",
    },
  })
}
