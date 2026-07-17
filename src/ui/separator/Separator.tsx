import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const separatorVariants = cva("shrink-0 bg-border", {
  variants: {
    orientation: {
      horizontal: "h-px w-full",
      vertical: "h-full w-px",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export interface SeparatorProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorVariants> {}

const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className, orientation, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation === "vertical" ? "vertical" : undefined}
      className={cn(separatorVariants({ orientation }), className)}
      {...props}
    />
  ),
);
Separator.displayName = "Separator";

export { Separator, separatorVariants };
