"use client"

import { useRef } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"

interface ConfirmDialogProps {
  /** Server Action that reads the hidden `id` field. */
  action: (formData: FormData) => Promise<void>
  appointmentId: string
  triggerLabel: string
  title: string
  description: string
  confirmLabel: string
  pendingLabel: string
}

/**
 * Guards the two irreversible actions in the panel, both one tap away from the
 * WhatsApp button on a phone used standing up. Native `<dialog>` +
 * `showModal()` gives a real modal — focus trap, Esc, `::backdrop` — without
 * shipping a dialog library.
 */
export function ConfirmDialog({
  action,
  appointmentId,
  triggerLabel,
  title,
  description,
  confirmLabel,
  pendingLabel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  return (
    <>
      <Button
        variant="danger"
        className="w-full"
        onClick={() => dialogRef.current?.showModal()}
      >
        {triggerLabel}
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
        <h2 className="font-serif text-xl text-foreground">{title}</h2>
        <p className="mt-3 text-sm text-muted">{description}</p>

        <form action={action} className="mt-6 flex flex-col gap-3">
          <input type="hidden" name="id" value={appointmentId} />
          <ConfirmActions
            confirmLabel={confirmLabel}
            pendingLabel={pendingLabel}
            onDismiss={() => dialogRef.current?.close()}
          />
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
function ConfirmActions({
  confirmLabel,
  pendingLabel,
  onDismiss,
}: {
  confirmLabel: string
  pendingLabel: string
  onDismiss: () => void
}) {
  const { pending } = useFormStatus()

  return (
    <>
      <Button type="submit" variant="danger" className="w-full" disabled={pending}>
        {pending ? pendingLabel : confirmLabel}
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
