import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

type Variant = "primary" | "secondary" | "ghost" | "danger"
type Size = "md" | "lg"

const variants: Record<Variant, string> = {
  primary: "bg-foreground text-background hover:bg-foreground/90",
  secondary: "border border-border bg-background text-foreground hover:bg-surface",
  ghost: "text-muted hover:bg-surface hover:text-foreground",
  danger: "border border-danger/40 text-danger hover:bg-danger/10",
}

const sizes: Record<Size, string> = {
  // 48px minimum: the panel is used standing up, on a phone, one-handed.
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-6 text-base",
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors duration-200",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
}
