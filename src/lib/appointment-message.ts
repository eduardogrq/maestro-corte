import { business } from "@/data/business"
import {
  formatDayLong,
  formatPriceMxn,
  formatTimeRange,
  utcToWallClock,
} from "@/lib/datetime"
import { buildWhatsAppUrl } from "@/lib/phone"

export interface AppointmentMessageData {
  clientName: string
  clientPhone: string
  serviceName: string
  priceMxn: number
  startsAt: Date
  endsAt: Date
  address: string | null
}

/**
 * The confirmation the barber sends after saving. We are not changing his habit
 * of confirming over WhatsApp — we are removing the typing. First name only:
 * writing "Hola, Juan Pérez" reads like a bank.
 */
export function buildConfirmationMessage(
  appointment: AppointmentMessageData,
  /** Signed link to the client's own view of the appointment. */
  publicUrl: string
): string {
  const { date } = utcToWallClock(appointment.startsAt)
  const firstName = appointment.clientName.trim().split(/\s+/)[0]

  const lines = [
    `Hola ${firstName}, confirmo tu cita con ${business.shortName}:`,
    "",
    `${appointment.serviceName}`,
    `${formatDayLong(date)}`,
    `${formatTimeRange(appointment.startsAt, appointment.endsAt)}`,
  ]

  if (appointment.address) {
    lines.push(`Dirección: ${appointment.address}`)
  }

  lines.push(
    `Costo: ${formatPriceMxn(appointment.priceMxn)}`,
    "",
    // The link stays true if the appointment moves later; this message won't.
    `Aquí puedes ver tu cita: ${publicUrl}`,
    "",
    "Cualquier cambio, avísame por aquí. ¡Nos vemos!"
  )

  return lines.join("\n")
}

/** `encodeURIComponent` inside `buildWhatsAppUrl` handles emojis and quotes in the notes. */
export function buildConfirmationUrl(
  appointment: AppointmentMessageData,
  publicUrl: string
): string {
  return buildWhatsAppUrl(
    appointment.clientPhone,
    buildConfirmationMessage(appointment, publicUrl)
  )
}
