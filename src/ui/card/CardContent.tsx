import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

// See CardHeader.tsx for the size-scale rationale. `pt-0` throughout because
// CardContent normally follows a CardHeader, which already carries its own
// bottom spacing via the flex gap.
const cardContentVariants = cva("", {
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

export interface CardContentProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardContentVariants> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size, ...props }, ref) => (
    <div ref={ref} className={cn(cardContentVariants({ size }), className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

export { CardContent, cardContentVariants };
