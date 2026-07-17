import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const statusDotVariants = cva("inline-block shrink-0 rounded-full", {
  variants: {
    variant: {
      neutral: "bg-muted",
      success: "bg-success",
      warning: "bg-warning",
      danger: "bg-danger",
      info: "bg-primary",
    },
    size: {
      sm: "size-2",
      md: "size-3",
    },
  },
  defaultVariants: {
    variant: "neutral",
    size: "md",
  },
});

export interface StatusDotProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusDotVariants> {
  pulse?: boolean;
}

const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
  ({ className, variant, size, pulse, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        statusDotVariants({ variant, size }),
        pulse && "animate-pulse",
        className,
      )}
      {...props}
    />
  ),
);
StatusDot.displayName = "StatusDot";

export { StatusDot, statusDotVariants };
