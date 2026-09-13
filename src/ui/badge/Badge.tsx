import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  // Density tokens (AGENTS.md §7 / Phase 3): min-height + vertical padding
  // come from --density-chip-* so Badge isn't vertically cramped next to
  // its text — was a bare `py-0.5` (2px), which reads as a sliver at
  // default text-xs line-height.
  //
  // w-max + max-w-full + overflow-hidden + wrap-anywhere contain pathological
  // long labels without collapsing table columns. `wrap-anywhere`
  // (`overflow-wrap: anywhere`) breaks an unbroken token inside the badge,
  // but on its own it also shrinks the badge's min-content width to one
  // character, so an auto-layout table column could squeeze a one-word
  // label ("Viewer") into a mid-word wrap. `w-max` (`width: max-content`)
  // makes the badge's min-content contribution its whole label again, while
  // `max-w-full` still caps it inside any definite-width container so the
  // token wraps there instead of overflowing. `overflow-hidden` collapses the
  // flex item's automatic min size so a badge can't push its parent row past
  // the viewport. `overflow-wrap: break-word` is not an option: the label is
  // an anonymous flex item whose min-width is the word, so it never breaks
  // and would just be clipped. We deliberately avoid `truncate`:
  // `text-overflow` doesn't render on an inline-flex box, and
  // `whitespace-nowrap` would change today's wrapping behaviour for
  // multi-word labels.
  "inline-flex items-center w-max max-w-full overflow-hidden wrap-anywhere rounded-ui-sm px-2.5 py-[var(--density-chip-py)] min-h-[var(--density-chip-min-h)] text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: ["text-secondary-fg", "bg-secondary/60"],
        primary: ["text-primary", "bg-primary/15"],
        success: ["text-success", "bg-success/15"],
        warning: ["text-warning", "bg-warning/15"],
        danger: ["text-danger", "bg-danger/15"],
      },
      tone: {
        solid: "",
        soft: "",
      },
    },
    compoundVariants: [
      {
        tone: "solid",
        variant: "neutral",
        className: "bg-secondary text-secondary-fg",
      },
      {
        tone: "solid",
        variant: "primary",
        className: "bg-primary text-primary-fg",
      },
      {
        tone: "solid",
        variant: "success",
        className: "bg-success text-success-fg",
      },
      {
        tone: "solid",
        variant: "warning",
        className: "bg-warning text-warning-fg",
      },
      {
        tone: "solid",
        variant: "danger",
        className: "bg-danger text-danger-fg",
      },
    ],
    defaultVariants: {
      variant: "neutral",
      tone: "solid",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, tone, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, tone }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
