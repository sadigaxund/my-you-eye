import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const spinnerVariants = cva("animate-spin rounded-full border-2 border-current border-t-transparent", {
  variants: {
    size: {
      sm: "size-4",
      md: "size-6",
      lg: "size-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SpinnerProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  ),
);
Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
