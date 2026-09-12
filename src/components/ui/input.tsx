import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { controlClassName, controlErrorClassName } from "./control-styles"

interface InputProps extends Omit<ComponentProps<"input">, "aria-invalid"> {
  invalid?: boolean
}

export function Input({ invalid, className, id, ...props }: InputProps) {
  return (
    <input
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
      className={cn(
        controlClassName,
        "min-h-12",
        invalid && controlErrorClassName,
        className
      )}
      {...props}
    />
  )
}
