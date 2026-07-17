import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

export { CardTitle };
