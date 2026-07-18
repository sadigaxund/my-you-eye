import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const cardVariants = cva("rounded-ui bg-surface text-fg", {
  variants: {
    variant: {
      default: "border border-border",
      outlined: "border-2 border-border",
      elevated: "border border-border shadow-lg",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant }), className)}
      style={{ borderWidth: "var(--border-width)", ...style }}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export { Card, cardVariants };
