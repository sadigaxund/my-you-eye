import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const headVariants = cva("font-medium text-muted align-middle", {
  variants: {
    density: {
      // Padding-driven, matching TableCell exactly (same p-2/p-3, same
      // text-xs/text-sm) so header and body rows compute the identical
      // height from the same box model instead of a fixed h-8/h-10 that
      // could disagree with the body's content+padding height. See
      // AGENTS.md §Step-B / TODO.md A4 "same vertical rhythm at each density".
      compact: "p-2 text-xs",
      normal: "p-3 text-sm",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    density: "normal",
    align: "left",
  },
});

export interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement>, VariantProps<typeof headVariants> {}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, density, align, ...props }, ref) => (
    <th ref={ref} className={cn(headVariants({ density, align }), className)} {...props} />
  ),
);
TableHead.displayName = "TableHead";

export { TableHead };
