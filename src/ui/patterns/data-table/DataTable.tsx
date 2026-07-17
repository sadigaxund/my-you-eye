import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../../lib/cn";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../../table";
import { CellValue } from "../../cell-value";
import { ScrollArea } from "../../scroll-area";
import type { CellValueType, UrlReplacement } from "../../cell-value";

type StatusVariant = "neutral" | "success" | "warning" | "danger" | "info";

export interface DataTableColumn {
  key: string;
  header: string;
  type?: CellValueType;
  align?: "left" | "right" | "center";
  badgeVariant?: "neutral" | "primary" | "success" | "warning" | "danger";
  badgeStyle?: "solid" | "soft";
  statusVariant?: StatusVariant | ((value: unknown) => StatusVariant);
  statusPulse?: boolean;
}

export interface DataTableProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof dataTableVariants> {
  columns: DataTableColumn[];
  rows: Record<string, unknown>[];
  stickyHeader?: boolean;
  replacements?: UrlReplacement[];
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
  ({ className, columns, rows, variant, density, stickyHeader, replacements, ...props }, ref) => (
    <ScrollArea ref={ref} className={cn("w-full", className)} {...props}>
      <Table variant={variant} density={density}>
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
                  <CellValue
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
