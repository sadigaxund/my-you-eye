import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const scrollAreaVariants = cva(
  // scrollbar-gutter: stable reserves the scrollbar's track space up front so
  // content doesn't reflow when a region becomes scrollable, and — combined
  // with rounding applied directly to THIS element rather than to a separate
  // ancestor wrapper — keeps the scrollbar's own clip in sync with the box's
  // border-radius instead of a mismatched ancestor clip cutting across the
  // corner. See AGENTS.md §0.10 / TODO.md A4. Consumers that need rounded
  // corners around a ScrollArea should apply `rounded-*` directly to the
  // ScrollArea (it clips its own overflow to its own radius), not to a
  // wrapping div.
  "[scrollbar-gutter:stable]",
  {
    variants: {
      orientation: {
        vertical: "overflow-y-auto overflow-x-hidden",
        horizontal: "overflow-x-auto overflow-y-hidden",
        both: "overflow-auto",
      },
    },
    defaultVariants: {
      orientation: "both",
    },
  },
);

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof scrollAreaVariants> {
  children: ReactNode;
  /**
   * Adds a CSS-mask fade at the scrollable edge(s) so a scrollable region
   * visibly reads as scrollable even before it's touched. Mask size comes
   * from the `--scrollarea-fade-size` token. Fades on the axis/axes implied
   * by `orientation` (both axes when orientation is "both").
   */
  fade?: boolean;
}

const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "both", fade, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        scrollAreaVariants({ orientation }),
        fade && (orientation === "vertical" ? "scroll-fade-y" : orientation === "horizontal" ? "scroll-fade-x" : "scroll-fade-xy"),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea, scrollAreaVariants };
