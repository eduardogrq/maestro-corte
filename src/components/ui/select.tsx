import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import { controlClassName, controlErrorClassName } from "./control-styles"

interface SelectProps extends Omit<ComponentProps<"select">, "aria-invalid"> {
  invalid?: boolean
}

export function Select({ invalid, className, id, children, ...props }: SelectProps) {
  return (
    <select
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
      className={cn(
        controlClassName,
        // `appearance-none` plus a painted caret: the native arrow renders
        // differently on every platform and clashes with the warm palette.
        "min-h-12 appearance-none bg-[length:1.1rem] bg-[right_1rem_center] bg-no-repeat pr-11",
        "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%238C8377%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
        invalid && controlErrorClassName,
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
}
