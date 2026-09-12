import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { controlClassName, controlErrorClassName } from "./control-styles"

interface TextareaProps extends Omit<ComponentProps<"textarea">, "aria-invalid"> {
  invalid?: boolean
}

export function Textarea({ invalid, className, id, rows = 3, ...props }: TextareaProps) {
  return (
    <textarea
      id={id}
      rows={rows}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
      className={cn(
        controlClassName,
        "resize-y",
        invalid && controlErrorClassName,
        className
      )}
      {...props}
    />
  )
}
