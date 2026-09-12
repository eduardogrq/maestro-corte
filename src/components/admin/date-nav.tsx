import Link from "next/link"
import { addDaysToDateString, formatDayLong, todayInMexicoCity } from "@/lib/datetime"

/**
 * Plain links, not client-side state: the agenda is server-rendered per day, so
 * navigating by URL keeps it shareable, back-button friendly and free of JS.
 */
export function DateNav({ date }: { date: string }) {
  const today = todayInMexicoCity()

  return (
    <div className="flex items-center justify-between gap-2">
      <Link
        href={`/admin?date=${addDaysToDateString(date, -1)}`}
        aria-label="Día anterior"
        className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-surface"
      >
        ←
      </Link>

      <div className="text-center">
        <p className="font-serif text-lg text-foreground">{formatDayLong(date)}</p>
        {date !== today && (
          <Link
            href="/admin"
            className="text-sm text-accent underline underline-offset-4"
          >
            Ir a hoy
          </Link>
        )}
      </div>

      <Link
        href={`/admin?date=${addDaysToDateString(date, 1)}`}
        aria-label="Día siguiente"
        className="flex min-h-12 min-w-12 items-center justify-center rounded-full border border-border text-foreground transition-colors duration-200 hover:bg-surface"
      >
        →
      </Link>
    </div>
  )
}
