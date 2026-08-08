import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

// See CardHeader.tsx for the size-scale rationale.
const cardFooterVariants = cva("flex items-center", {
  variants: {
    size: {
      sm: "p-panel-sm pt-0",
      md: "p-panel pt-0",
      lg: "p-panel-lg pt-0",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardFooterVariants> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size, ...props }, ref) => (
    <div ref={ref} className={cn(cardFooterVariants({ size }), className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

export { CardFooter, cardFooterVariants };
