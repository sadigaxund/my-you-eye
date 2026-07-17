import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-ui-sm px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-secondary text-secondary-fg",
        primary: "bg-primary text-primary-fg",
        success: "bg-success text-bg",
        warning: "bg-warning text-bg",
        danger: "bg-danger text-primary-fg",
      },
      style: {
        solid: "",
        soft: "bg-opacity-15",
      },
    },
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
