import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

// A two-tone added/removed line-count chip — the "+12 -5" unit that rides in
// pane headers and status bars next to a filename (issue #14). Deliberately
// lighter than Badge: no pill, border, or padding chrome, just two colored
// numbers in the mono face so a diff stat never competes with real badges.
// Colors reuse DiffBlock's own success/danger tokens so chip and diff body
// always agree on what "added" looks like. Sizes map to the type scale
// tokens (text-xs / text-sm) rather than the vsnote prototype's raw 12/13px
// — token discipline beats pixel parity across themes.

const diffStatChipVariants = cva("inline-flex items-center font-mono tabular-nums", {
  variants: {
    size: {
      sm: "gap-1.5 text-xs",
      md: "gap-2 text-sm",
    },
  },
  defaultVariants: {
    size: "sm",
  },
});

export interface DiffStatChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof diffStatChipVariants> {
  /** Number of added lines, rendered as "+N". */
  added: number;
  /** Number of removed lines, rendered as "-N". */
  removed: number;
}

const DiffStatChip = forwardRef<HTMLSpanElement, DiffStatChipProps>(
  ({ className, size, added, removed, ...props }, ref) => (
    <span ref={ref} className={cn(diffStatChipVariants({ size }), className)} {...props}>
      <span aria-hidden="true" className="text-success">
        +{added}
      </span>
      <span aria-hidden="true" className="text-danger">
        -{removed}
      </span>
      <span className="sr-only">
        {added} addition{added === 1 ? "" : "s"}, {removed} deletion{removed === 1 ? "" : "s"}
      </span>
    </span>
  ),
);
DiffStatChip.displayName = "DiffStatChip";

export { DiffStatChip, diffStatChipVariants };
