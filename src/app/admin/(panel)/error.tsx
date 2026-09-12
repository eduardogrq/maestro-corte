"use client"

import { Button } from "@/components/ui/button"

/**
 * The most likely cause here is Neon being unreachable. A retry usually fixes
 * it, so the recovery is one tap and the message says what to do.
 */
export default function PanelError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-danger/40 bg-danger/5 px-4 py-6">
      <p className="text-base font-medium text-foreground">
        No se pudo cargar la agenda.
      </p>
      <p className="text-sm text-muted">
        Puede ser la conexión con la base de datos. Intenta de nuevo.
      </p>
      <Button onClick={reset} variant="secondary">
        Reintentar
      </Button>
    </div>
  )
}
