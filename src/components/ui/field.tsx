import type { ReactNode } from "react"

interface FieldProps {
  /** Must match the `id` of the control inside, so the label is clickable. */
  htmlFor: string
  label: string
  hint?: string
  error?: string
  optional?: boolean
  children: ReactNode
}

export function Field({
  htmlFor,
  label,
  hint,
  error,
  optional,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
        {optional && <span className="ml-1 font-normal text-muted">(opcional)</span>}
      </label>

      {children}

      {/* The error replaces the hint: two lines of small text under a control
          is noise on a 390px screen. */}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-hint`} className="text-sm text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}
