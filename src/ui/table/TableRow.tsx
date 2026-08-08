import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

// No `density` variant here — TableHead/TableCell own row height via their own
// padding (see AGENTS.md §Step-B / TODO.md A2: the old density variant on
// Table/TableRow was a no-op that advertised control it didn't have; removed
// rather than reimplemented since TableCell/TableHead already fully determine
// row height). `DataTable`'s `density` prop still works end to end — it's
// forwarded only to TableHead/TableCell.
const rowClassName =
  "border-b transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:bg-secondary/50 data-[state=selected]:bg-secondary";

export type TableRowProps = HTMLAttributes<HTMLTableRowElement>;

const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => <tr ref={ref} className={cn(rowClassName, className)} {...props} />,
);
TableRow.displayName = "TableRow";

export { TableRow };
