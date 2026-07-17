import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type TypographyProps = HTMLAttributes<HTMLDivElement>;

const Typography = forwardRef<HTMLDivElement, TypographyProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {children}
    </div>
  ),
);
Typography.displayName = "Typography";

export { Typography };
