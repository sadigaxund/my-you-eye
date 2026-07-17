import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const headVariants = cva("text-left font-medium text-muted", {
  variants: {
    density: {
      compact: "h-8 px-2 text-xs",
      normal: "h-10 px-3 text-sm",
    },
  },
  defaultVariants: {
    density: "normal",
  },
});

export interface TableHeadProps extends HTMLAttributes<HTMLTableCellElement>, VariantProps<typeof headVariants> {}

const TableHead = forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, density, ...props }, ref) => (
    <th ref={ref} className={cn(headVariants({ density }), className)} {...props} />
  ),
);
TableHead.displayName = "TableHead";

export { TableHead };
