import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export { CardHeader };
