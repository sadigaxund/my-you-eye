import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const cellVariants = cva("", {
  variants: {
    density: {
      compact: "p-2 text-xs",
      normal: "p-3 text-sm",
    },
  },
  defaultVariants: {
    density: "normal",
  },
});

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement>, VariantProps<typeof cellVariants> {}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, density, ...props }, ref) => (
    <td ref={ref} className={cn(cellVariants({ density }), className)} {...props} />
  ),
);
TableCell.displayName = "TableCell";

export { TableCell };
