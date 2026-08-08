import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const tableVariants = cva("w-full caption-bottom text-sm", {
  variants: {
    variant: {
      default: "",
      striped: "[&_tbody_tr:nth-child(odd)]:bg-secondary/50",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface TableProps
  extends HTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {}

const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, ...props }, ref) => (
    <div className="relative w-full">
      <table ref={ref} className={cn(tableVariants({ variant }), className)} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

export { Table, tableVariants };
