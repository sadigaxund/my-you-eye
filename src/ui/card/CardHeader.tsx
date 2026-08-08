import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

// "md" (--spacing-panel, 1rem) is the new default — was a hardcoded p-6
// (1.5rem), now token-sourced and aligned with Alert's existing p-panel so
// Card/Alert/StatCard read as one density scale. The old visual size is
// still available as size="lg". See AGENTS.md §Step-B / TODO.md A5.
const cardHeaderVariants = cva("flex flex-col gap-1.5", {
  variants: {
    size: {
      sm: "p-panel-sm",
      md: "p-panel",
      lg: "p-panel-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardHeaderVariants> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size, ...props }, ref) => (
    <div ref={ref} className={cn(cardHeaderVariants({ size }), className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export { CardHeader, cardHeaderVariants };
