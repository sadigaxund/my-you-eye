import { Children, forwardRef } from "react";
import type { OlHTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

/**
 * Tone and size are expressed as two custom properties on the list (`--thread-color`,
 * `--thread-marker`) that every `ThreadStop` reads, so a stop can never disagree with
 * its list and no context is needed.
 */
const threadVariants = cva("relative m-0 list-none p-0", {
  variants: {
    tone: {
      default: "[--thread-color:var(--color-border)] [--thread-current:var(--color-muted)]",
      accent: "[--thread-color:var(--color-primary)] [--thread-current:var(--color-primary)]",
    },
    size: {
      sm: "[--thread-marker:var(--spacing-thread-stop-sm)] text-sm",
      md: "[--thread-marker:var(--spacing-thread-stop-md)] text-base",
    },
  },
  defaultVariants: { tone: "default", size: "md" },
});

export interface ThreadProps
  extends OlHTMLAttributes<HTMLOListElement>,
    VariantProps<typeof threadVariants> {}

/**
 * A plain vertical rule with stops (career history, step list, document outline).
 * Zero state: with no children it renders nothing (`null`) rather than an empty box.
 */
const Thread = forwardRef<HTMLOListElement, ThreadProps>(
  ({ className, tone, size, children, ...props }, ref) => {
    if (Children.count(children) === 0) return null;
    return (
      <ol ref={ref} className={cn(threadVariants({ tone, size }), className)} {...props}>
        {children}
      </ol>
    );
  },
);
Thread.displayName = "Thread";

export { Thread, threadVariants };
