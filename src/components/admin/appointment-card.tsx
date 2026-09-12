import Link from "next/link"
import { SyncBadge } from "@/components/admin/sync-badge"
import { formatPriceMxn, formatTime, formatTimeRange } from "@/lib/datetime"
import { buildMapsUrl } from "@/lib/maps"
import { buildTelUrl, formatMxPhone } from "@/lib/phone"
import type { Appointment } from "@/server/db/schema"

/**
 * A card, not a table row: tables are unreadable on a phone, and this list is
 * read standing up between haircuts.
 */
export function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const isCancelled = appointment.status === "cancelled"

  return (
    <article
      className={`rounded-xl border border-border bg-background px-4 py-4 ${
        isCancelled ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p
          className={`font-serif text-xl text-foreground ${
            isCancelled ? "line-through" : ""
          }`}
        >
          {formatTime(appointment.startsAt)}
        </p>
        <p className="text-sm text-muted">
          {formatTimeRange(appointment.startsAt, appointment.endsAt)}
        </p>
      </div>

      <Link
        href={`/admin/appointments/${appointment.id}`}
        className="mt-1 block text-base font-medium text-foreground underline-offset-4 hover:underline"
      >
        {appointment.clientName}
      </Link>

      <p className="mt-0.5 text-sm text-muted">
        {appointment.serviceName} · {formatPriceMxn(appointment.priceMxn)}
      </p>

      {isCancelled && <p className="mt-2 text-sm text-danger">Cancelada</p>}

      {/* One tap to call, one tap to navigate: the two things needed on the way. */}
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={buildTelUrl(appointment.clientPhone)}
          className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm text-foreground transition-colors duration-200 hover:bg-surface"
        >
          {formatMxPhone(appointment.clientPhone)}
        </a>

        {appointment.address && (
          <a
            href={buildMapsUrl(appointment.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm text-foreground transition-colors duration-200 hover:bg-surface"
          >
            Ver en Maps
          </a>
        )}
      </div>

      {!isCancelled && (
        <div className="mt-3">
          <SyncBadge appointment={appointment} compact />
        </div>
      )}
    </article>
  )
}
