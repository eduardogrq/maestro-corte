/**
 * Shared by input, select and textarea so the three never drift apart.
 *
 * `text-base` is not decorative: iOS Safari zooms the viewport on focus for any
 * control under 16px, and getting back out of that zoom mid-form is miserable.
 */
export const controlClassName =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground " +
  "placeholder:text-muted/70 transition-colors duration-200 " +
  "hover:border-muted/50 focus:border-accent focus:outline-none " +
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted"

export const controlErrorClassName = "border-danger hover:border-danger focus:border-danger"
