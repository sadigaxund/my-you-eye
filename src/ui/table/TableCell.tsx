import { forwardRef } from "react";
import type { TdHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const cellVariants = cva("overflow-hidden min-w-0 align-middle", {
  variants: {
    density: {
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

// TdHTMLAttributes, not HTMLAttributes: a `<td>` legitimately carries
// colSpan/rowSpan/headers, and a table that can't span a cell can't render a
// footnote row (the showcase's generated API reference needs exactly that).
// Pure type widening — no new component prop, no visual change.
// `align` is omitted from the DOM attribute set because this component
// already owns that name as a CVA axis (left/center/right) — the deprecated
// HTML `align` attribute would collide with it and also permits values
// ("justify", "char") the variant has no styling for.
export interface TableCellProps
  extends Omit<TdHTMLAttributes<HTMLTableCellElement>, "align">,
    VariantProps<typeof cellVariants> {}

const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, density, align, ...props }, ref) => (
    <td ref={ref} className={cn(cellVariants({ density, align }), className)} {...props} />
  ),
);
TableCell.displayName = "TableCell";

export { TableCell };
