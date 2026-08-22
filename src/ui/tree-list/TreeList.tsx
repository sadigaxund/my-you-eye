import { forwardRef, useMemo, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../table";
import { CellType } from "../cell-type";
import type { CellValueType, UrlReplacement } from "../cell-type";

export interface TreeListColumn {
  key: string;
  header: string;
  /** Typed cells render through CellType — same contract as DataTable. */
  type?: CellValueType;
  align?: "left" | "right" | "center";
}

export interface TreeListNode {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Values keyed by column.key; rendered through the column's type. */
  cells?: Record<string, unknown>;
  children?: TreeListNode[];
}

export const treeListVariants = cva("", {
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

export interface TreeListProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onSelect">,
  VariantProps<typeof treeListVariants> {
  columns: TreeListColumn[];
  nodes: TreeListNode[];
  defaultExpandedDepth?: number;
  expandedIds?: Set<string>;
  onExpandedChange?: (id: string) => void;
  selectedId?: string;
  onSelect?: (node: TreeListNode) => void;
  stickyHeader?: boolean;
  replacements?: UrlReplacement[];
}

interface FlatRow {
  node: TreeListNode;
  depth: number;
  hasChildren: boolean;
  isLast: boolean;
  ancestorLines: boolean[];
}

function flatten(nodes: TreeListNode[], expanded: Set<string>, depth: number, ancestorLines: boolean[], acc: FlatRow[]): FlatRow[] {
  nodes.forEach((node, i) => {
    const isLast = i === nodes.length - 1;
    const hasChildren = !!node.children?.length;
    acc.push({ node, depth, hasChildren, isLast, ancestorLines });
    if (hasChildren && expanded.has(node.id)) flatten(node.children!, expanded, depth + 1, [...ancestorLines, !isLast], acc);
  });
  return acc;
}

// Tree × table hybrid (#26): rows expand like a tree, but each row carries
// typed columns rendered through CellType — the shape "a table whose rows
// can expand" that neither DataTable (flat) nor TreeView (label-only) covers.
// Expansion follows TreeView's model: controlled via expandedIds/onToggle or
// uncontrolled from defaultExpandedDepth.
const TreeList = forwardRef<HTMLDivElement, TreeListProps>(
  (
    { className, columns, nodes, density, defaultExpandedDepth = 1, expandedIds, onExpandedChange, selectedId, onSelect, stickyHeader, replacements, ...props },
    ref,
  ) => {
    const [internalExpanded, setInternalExpanded] = useState(() => {
      const set = new Set<string>();
      const walk = (list: TreeListNode[], depth: number) => {
        for (const n of list) {
          if (n.children?.length && depth < defaultExpandedDepth) {
            set.add(n.id);
            walk(n.children, depth + 1);
          }
        }
      };
      walk(nodes, 0);
      return set;
    });
    const expanded = expandedIds ?? internalExpanded;

    const toggle = (id: string) => {
      if (expandedIds) {
        onExpandedChange?.(id);
        return;
      }
      setInternalExpanded((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    };

    const rows = useMemo(() => flatten(nodes, expanded, 0, [], []), [nodes, expanded]);

    return (
      <div ref={ref} className={cn("w-full overflow-x-auto", className)} {...props}>
        <Table>
          <TableHeader sticky={stickyHeader}>
            <TableRow>
              <TableHead density={density}>Name</TableHead>
              {columns.map((col) => (
                <TableHead key={col.key} density={density} align={col.align}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ node, depth, hasChildren, isLast, ancestorLines }) => {
              const open = hasChildren && expanded.has(node.id);
              return (
                <TableRow
                  key={node.id}
                  aria-expanded={hasChildren ? open : undefined}
                  aria-selected={node.id === selectedId || undefined}
                  onClick={() => {
                    if (hasChildren) toggle(node.id);
                    onSelect?.(node);
                  }}
                  className={cn("cursor-pointer", node.id === selectedId && "bg-surface-active")}
                >
                  <TableCell density={density}>
                    <span className="flex min-w-0 items-center gap-1.5">
                      {/* Indent guides mirror TreeItem's elbow geometry at a
                          smaller cost: per-ancestor vertical line + elbow. */}
                      {ancestorLines.map((line, i) => (
                        <span key={i} aria-hidden="true" className="relative w-3 shrink-0 self-stretch">
                          {line && <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border/60" />}
                        </span>
                      ))}
                      {depth > 0 && (
                        <span aria-hidden="true" className="relative w-3 shrink-0 self-stretch">
                          <span className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-border/60" style={{ height: isLast ? "50%" : "100%" }} />
                          <span className="absolute left-1/2 top-1/2 h-px w-1.5 -translate-y-1/2 bg-border/60" />
                        </span>
                      )}
                      {hasChildren ? (
                        <svg
                          viewBox="0 0 12 12"
                          aria-hidden="true"
                          className={cn(
                            "size-3 shrink-0 fill-none stroke-current text-muted transition-transform duration-[var(--duration-fast)]",
                            open && "rotate-90",
                          )}
                        >
                          <path d="M4 2l4 4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <span className="size-3 shrink-0" />
                      )}
                      {node.icon && <span className="shrink-0 [&>svg]:size-3.5">{node.icon}</span>}
                      <span className="truncate text-sm">{node.label}</span>
                    </span>
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell key={col.key} density={density} align={col.align}>
                      {node.cells?.[col.key] !== undefined ? (
                        <CellType type={col.type ?? "text"} value={node.cells[col.key]} replacements={replacements} />
                      ) : null}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  },
);
TreeList.displayName = "TreeList";

export { TreeList };
