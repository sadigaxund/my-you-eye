import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export type KbdProps = HTMLAttributes<HTMLElement>;

const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ className, ...props }, ref) => (
    <kbd
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-ui-sm border border-border bg-secondary px-1.5 py-[var(--density-chip-py)] min-h-[var(--density-chip-min-h)] text-xs font-mono text-muted shadow-card",
        className,
      )}
      {...props}
    />
  ),
);
Kbd.displayName = "Kbd";

export { Kbd };
