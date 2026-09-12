/**
 * Neon's free tier autosuspends after ~5 minutes, so the first query of the day
 * costs an extra second. This makes that wait visible instead of a dead screen.
 */
export default function PanelLoading() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando…</span>
      {[0, 1, 2].map((row) => (
        <div key={row} className="h-28 animate-pulse rounded-xl bg-surface" />
      ))}
    </div>
  )
}
