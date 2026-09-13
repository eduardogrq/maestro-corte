"use client"

import { useRef } from "react"
import { useFormStatus } from "react-dom"
import { cancelAppointmentAction } from "@/actions/appointments"
import { Button } from "@/components/ui/button"

interface CancelAppointmentDialogProps {
  appointmentId: string
  clientName: string
  /** Only a synced appointment has an event to remove from Calendar. */
  inCalendar: boolean
}

/**
 * Cancelling is the one irreversible action in the panel, and it is one tap away
 * from the WhatsApp button on a phone used standing up. Native `<dialog>` +
 * `showModal()` gives a real modal (focus trap, Esc, `::backdrop`) without
 * shipping a dialog library.
 */
export function CancelAppointmentDialog({
  appointmentId,
  clientName,
  inCalendar,
}: CancelAppointmentDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <Button
        variant="danger"
        className="w-full"
        onClick={() => dialogRef.current?.showModal()}
      >
        Cancelar cita
      </Button>

      <dialog
        ref={dialogRef}
        // A tap on the backdrop targets the dialog element itself, never its content.
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close()
        }}
        // `m-auto` on purpose: Tailwind's preflight zeroes the margin the browser
        // uses to center a modal dialog.
        className="m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-sm overflow-auto rounded-2xl border border-border bg-background p-6 text-foreground backdrop:bg-foreground/50"
      >
        <h2 className="font-serif text-xl text-foreground">
          ¿Cancelar la cita de {clientName}?
        </h2>

        <p className="mt-3 text-sm text-muted">
          {inCalendar
            ? "Se quita de tu calendario de Google y no se puede deshacer."
            : "No se puede deshacer."}{" "}
          El cliente no recibe ningún aviso: si ya quedaste con él, avísale por
          WhatsApp.
        </p>

        <form action={cancelAppointmentAction} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="id" value={appointmentId} />
          <ConfirmActions onDismiss={() => dialogRef.current?.close()} />
        </form>
      </dialog>
    </>
  )
}

/**
 * Separate component so `useFormStatus` can read the pending state of the form
 * above it. The safe option sits at the bottom, closest to the thumb, so the
 * easiest tap is the one that changes nothing.
 */
function ConfirmActions({ onDismiss }: { onDismiss: () => void }) {
  const { pending } = useFormStatus()

  return (
    <>
      <Button type="submit" variant="danger" className="w-full" disabled={pending}>
        {pending ? "Cancelando…" : "Sí, cancelar la cita"}
      </Button>

      <Button
        variant="secondary"
        className="w-full"
        onClick={onDismiss}
        disabled={pending}
      >
        No, dejarla así
      </Button>
    </>
  )
}
