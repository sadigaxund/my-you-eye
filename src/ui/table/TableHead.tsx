import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const headVariants = cva("font-medium text-muted", {
  variants: {
    density: {
      compact: "h-8 px-2 text-xs",
      normal: "h-10 px-3 text-sm",
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
