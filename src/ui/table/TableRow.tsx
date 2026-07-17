import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { cva, type VariantProps } from "class-variance-authority";

const rowVariants = cva("border-b transition-colors hover:bg-secondary/50 data-[state=selected]:bg-secondary", {
  variants: {
    density: {
      compact: "",
      normal: "",
    },
  },
  defaultVariants: {
    density: "normal",
  },
});

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement>, VariantProps<typeof rowVariants> {}

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, density, ...props }, ref) => (
    <tr ref={ref} className={cn(rowVariants({ density }), className)} {...props} />
  ),
);
TableRow.displayName = "TableRow";

export { TableRow };
