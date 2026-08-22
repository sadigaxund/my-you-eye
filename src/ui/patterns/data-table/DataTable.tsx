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
  /** Stable React key for a row. Provide it whenever `rows` can be reordered,
   *  filtered, or spliced — without it rows are keyed by index, so React reuses
   *  the wrong DOM (and any cell state inside it) after the array shifts. */
  rowKey?: (row: Record<string, unknown>, index: number) => string | number;
  /** Row-level click (open-detail pattern). Clicks on interactive descendants
   *  (buttons, links, inputs) inside the row never trigger it. Keyboard users
   *  reach the same destination through focusable controls in the row — keep
   *  at least one real button/link per row when rows are clickable. */
  onRowClick?: (row: Record<string, unknown>, e: React.MouseEvent<HTMLTableRowElement>) => void;
  /** Per-row action controls rendered in a trailing cell (#25) — icon buttons,
   *  menus. Return real controls; they own their own handlers/confirm flows. */
  renderActions?: (row: Record<string, unknown>) => React.ReactNode;
  /** Column header for the actions cell. Default "Actions". */
  actionsHeader?: string;
  /** Width of the trailing actions column under layout="fixed" (any CSS width:
   *  "10%", "8rem"). Unset, the column shares the leftover space equally. */
  actionsWidth?: string;
}

const INTERACTIVE_SELECTOR = "button,a,input,select,textarea,label,[role='button'],[role='menuitem']";

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
  ({ className, columns, rows, variant, density, stickyHeader, replacements, layout = "fixed", rowKey, onRowClick, renderActions, actionsHeader = "Actions", actionsWidth, ...props }, ref) => {
    const hasActions = Boolean(renderActions);
    // `density` is intentionally NOT forwarded to Table/TableRow — that variant
    // was a no-op there (see TODO.md A2) and was removed. TableHead/TableCell
    // are the real owners of row density; it reaches them below.
    // ScrollArea (not an extra rounded/overflow-hidden wrapper) is the element
    // that should carry any rounding a consumer wants, so its own overflow-auto
    // box owns both the clip radius and the scrollbar — see ScrollArea's own
    // comment for why a separate ancestor wrapper mis-renders the corner.
    return (
      <ScrollArea ref={ref} className={cn("w-full", className)} {...props}>
        <Table
          variant={variant}
          className={layout === "fixed" ? "table-fixed" : "table-auto"}
        >
          {layout === "fixed" && (
            <colgroup>
              {columns.map((col) => (
                <col key={col.key} style={col.width ? { width: COLUMN_WIDTH_SCALE[col.width] } : undefined} />
              ))}
              {hasActions && <col style={actionsWidth ? { width: actionsWidth } : undefined} />}
            </colgroup>
          )}
          <TableHeader sticky={stickyHeader}>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} density={density} align={col.align}>
                  {col.header}
                </TableHead>
              ))}
              {hasActions && <TableHead density={density} align="right">{actionsHeader}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow
                key={rowKey ? rowKey(row, i) : i}
                className={onRowClick ? "cursor-pointer" : undefined}
                onClick={
                  onRowClick
                    ? (e) => {
                        // Clicks that land on a real control inside the row
                        // belong to that control, not the row.
                        if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
                        onRowClick(row, e);
                      }
                    : undefined
                }
              >
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
                {hasActions && (
                  <TableCell density={density} align="right">
                    {renderActions!(row)}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  },
);
DataTable.displayName = "DataTable";

export { DataTable, dataTableVariants };
