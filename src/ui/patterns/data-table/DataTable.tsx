import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/cn";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../table";
import { CellType } from "../../cell-type";
import { ScrollArea } from "../../scroll-area";
import type { CellValueType, UrlReplacement } from "../../cell-type";

type StatusVariant = "neutral" | "success" | "warning" | "danger" | "info";

export interface DataTableColumn {
  key: string;
  header: string;
  type?: CellValueType;
  align?: "left" | "right" | "center";
  /** Relative width hint for table-fixed layout. Omit for equal share of remaining space. */
  width?: "xs" | "sm" | "md" | "lg" | "xl";
  badgeVariant?: "neutral" | "primary" | "success" | "warning" | "danger";
  badgeStyle?: "solid" | "soft";
  statusVariant?: StatusVariant | ((value: unknown) => StatusVariant);
  statusPulse?: boolean;
}

const COLUMN_WIDTH_SCALE: Record<NonNullable<DataTableColumn["width"]>, string> = {
  xs: "8%",
  sm: "12%",
  md: "18%",
  lg: "26%",
  xl: "34%",
};

export interface DataTableProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof dataTableVariants> {
  columns: DataTableColumn[];
  rows: Record<string, unknown>[];
  stickyHeader?: boolean;
  replacements?: UrlReplacement[];
  /** "fixed" locks columns to width hints/equal share (default). "auto" sizes columns
   *  to content and enables horizontal scroll — use for rows with divergent content
   *  widths (e.g. a type smoke test) where fixed columns would clip legitimate content. */
  layout?: "fixed" | "auto";
}

const dataTableVariants = cva("", {
  variants: {
    variant: {
      default: "",
      striped: "",
    },
    density: {
      compact: "",
      normal: "",
    },
  },
  defaultVariants: {
    variant: "default",
    density: "normal",
  },
});

const DataTable = forwardRef<HTMLDivElement, DataTableProps>(
  ({ className, columns, rows, variant, density, stickyHeader, replacements, layout = "fixed", ...props }, ref) => (
    <ScrollArea ref={ref} className={cn("w-full", className)} {...props}>
      <Table
        variant={variant}
        density={density}
        className={layout === "fixed" ? "table-fixed" : "table-auto"}
      >
        {layout === "fixed" && (
          <colgroup>
            {columns.map((col) => (
              <col key={col.key} style={col.width ? { width: COLUMN_WIDTH_SCALE[col.width] } : undefined} />
            ))}
          </colgroup>
        )}
        <TableHeader sticky={stickyHeader}>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} density={density} align={col.align}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i} density={density}>
              {columns.map((col) => (
                  <TableCell key={col.key} density={density} align={col.align}>
                  <CellType
                    type={col.type}
                    value={row[col.key]}
                    badgeVariant={col.badgeVariant}
                    badgeStyle={col.badgeStyle}
                    statusVariant={typeof col.statusVariant === "function" ? col.statusVariant(row[col.key]) : col.statusVariant}
                    statusPulse={col.statusPulse}
                    replacements={replacements}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  ),
);
DataTable.displayName = "DataTable";

export { DataTable, dataTableVariants };
