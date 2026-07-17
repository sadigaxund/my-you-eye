import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-ui-sm px-2.5 py-0.5 text-xs font-medium",
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
        className: "bg-success text-bg",
      },
      {
        style: "solid",
        variant: "warning",
        className: "bg-warning text-bg",
      },
      {
        style: "solid",
        variant: "danger",
        className: "bg-danger text-primary-fg",
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
