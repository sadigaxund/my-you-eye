import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

export { CardContent };
