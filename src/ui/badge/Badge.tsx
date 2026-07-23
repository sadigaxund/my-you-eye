import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  // Density tokens (AGENTS.md §7 / Phase 3): min-height + vertical padding
  // come from --density-chip-* so Badge isn't vertically cramped next to
  // its text — was a bare `py-0.5` (2px), which reads as a sliver at
  // default text-xs line-height.
  "inline-flex items-center rounded-ui-sm px-2.5 py-[var(--density-chip-py)] min-h-[var(--density-chip-min-h)] text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: ["text-secondary-fg", "bg-secondary/60"],
        primary: ["text-primary", "bg-primary/15"],
        success: ["text-success", "bg-success/15"],
        warning: ["text-warning", "bg-warning/15"],
        danger: ["text-danger", "bg-danger/15"],
      },
      style: {
        solid: "",
        soft: "",
      },
    },
    compoundVariants: [
      {
        style: "solid",
        variant: "neutral",
        className: "bg-secondary text-secondary-fg",
      },
      {
        style: "solid",
        variant: "primary",
        className: "bg-primary text-primary-fg",
      },
      {
        style: "solid",
        variant: "success",
        className: "bg-success text-success-fg",
      },
      {
        style: "solid",
        variant: "warning",
        className: "bg-warning text-warning-fg",
      },
      {
        style: "solid",
        variant: "danger",
        className: "bg-danger text-danger-fg",
      },
    ],
    defaultVariants: {
      variant: "neutral",
      style: "solid",
    },
  },
);

export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "style">,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, style, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant, style }), className)} {...props} />
  ),
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
