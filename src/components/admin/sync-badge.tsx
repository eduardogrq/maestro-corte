import { retrySyncAction } from "@/actions/appointments"
import type { Appointment } from "@/server/db/schema"

interface SyncBadgeProps {
  appointment: Pick<Appointment, "id" | "calendarSync" | "calendarError">
  /** Compact form for the agenda list; the detail view shows the reason and a retry. */
  compact?: boolean
}

/**
 * Sync failures are never silent. If the appointment did not reach Google
 * Calendar, the barber has to know — otherwise he trusts a calendar that is
 * missing a client.
 */
export function SyncBadge({ appointment, compact }: SyncBadgeProps) {
  if (appointment.calendarSync === "synced") {
    if (compact) return null

    return (
      <p className="text-sm text-success">En el calendario de Google</p>
    )
  }

  const isPending = appointment.calendarSync === "pending"
  const tone = isPending ? "text-warning" : "text-danger"
  const label = isPending ? "Sincronizando con el calendario…" : "No está en el calendario"

  if (compact) {
    return <span className={`text-xs ${tone}`}>⚠ {label}</span>
  }

  return (
    <div
      className={`flex flex-col gap-3 rounded-xl border px-4 py-4 ${
        isPending ? "border-warning/40 bg-warning/5" : "border-danger/40 bg-danger/5"
      }`}
    >
      <p className={`text-sm font-medium ${tone}`}>{label}</p>
      <p className="text-sm text-muted">
        La cita ya está guardada aquí. Solo falta que aparezca en Google Calendar.
      </p>

      {appointment.calendarError && (
        <p className="break-words text-xs text-muted">{appointment.calendarError}</p>
      )}

      <form action={retrySyncAction}>
        <input type="hidden" name="id" value={appointment.id} />
        <button
          type="submit"
          className="min-h-12 rounded-full border border-border bg-background px-5 text-base font-medium text-foreground transition-colors duration-200 hover:bg-surface"
        >
          Reintentar
        </button>
      </form>
    </div>
  )
}
