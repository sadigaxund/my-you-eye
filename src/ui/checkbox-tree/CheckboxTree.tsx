import { forwardRef, useMemo, useState } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Checkbox } from "../checkbox";

export interface CheckboxTreeNode {
  /** Row key AND the value onNodeToggle reports — typically a path from the data root. */
  id: string;
  name: string;
  type: "file" | "folder";
  children?: CheckboxTreeNode[];
}

export interface CheckboxTreeProps extends Omit<HTMLAttributes<HTMLUListElement>, "children"> {
  data: CheckboxTreeNode[];
  /** Ids of every currently-included FILE. Folder state is never stored —
   *  it is derived fresh from this set on every render, so it can't drift
   *  from what the rows show (the checked-set owner stays external). */
  checked: ReadonlySet<string>;
  onNodeToggle: (node: CheckboxTreeNode, nextChecked: boolean) => void;
}

type RowState = "checked" | "unchecked" | "indeterminate";

function collectFileIds(node: CheckboxTreeNode, into: string[]): string[] {
  if (node.type === "file") {
    into.push(node.id);
    return into;
  }
  for (const child of node.children ?? []) collectFileIds(child, into);
  return into;
}

function rowState(node: CheckboxTreeNode, checked: ReadonlySet<string>): RowState {
  const files = collectFileIds(node, []);
  if (files.length === 0) return "unchecked";
  const included = files.filter((id) => checked.has(id)).length;
  if (included === 0) return "unchecked";
  if (included === files.length) return "checked";
  return "indeterminate";
}

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    viewBox="0 0 8 8"
    aria-hidden="true"
    className={cn("size-2.5 shrink-0 fill-none stroke-current strokeWidth-[1.25] text-muted transition-transform duration-[var(--duration-fast)]", open && "rotate-90")}
  >
    <path d="M2.5 0.5l3.5 3.5-3.5 3.5" />
  </svg>
);

const CheckboxTree = forwardRef<HTMLUListElement, CheckboxTreeProps>(
  ({ className, data, checked, onNodeToggle, ...props }, ref) => {
    // Expand/collapse is the only internal state; defaults to fully open.
    const [closed, setClosed] = useState<ReadonlySet<string>>(new Set());

    const rows = useMemo(() => {
      const out: { node: CheckboxTreeNode; depth: number }[] = [];
      const walk = (nodes: CheckboxTreeNode[], depth: number) => {
        for (const node of nodes) {
          out.push({ node, depth });
          if (node.children && !closed.has(node.id)) walk(node.children, depth + 1);
        }
      };
      walk(data, 0);
      return out;
    }, [data, closed]);

    return (
      <ul ref={ref} role="tree" aria-multiselectable className={cn("list-none m-0 p-0 select-none", className)} {...props}>
        {rows.map(({ node, depth }) => {
          const state = rowState(node, checked);
          const isFolder = node.type === "folder";
          const open = isFolder && !closed.has(node.id);
          return (
            <li key={node.id} role="treeitem" aria-expanded={isFolder ? open : undefined} data-checkbox-state={state}>
              <div
                className={cn(
                  "flex h-[var(--spacing-tree-row)] items-center gap-1.5 pr-2 text-sm",
                  state === "unchecked" && "opacity-55",
                )}
                style={{ paddingLeft: `calc(var(--grid-unit) * ${depth} + 2px)` }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={
                    isFolder
                      ? () =>
                          setClosed((prev) => {
                            const next = new Set(prev);
                            if (next.has(node.id)) next.delete(node.id);
                            else next.add(node.id);
                            return next;
                          })
                      : undefined
                  }
                  className={cn("flex size-4 items-center justify-center rounded-ui-sm", !isFolder && "invisible")}
                  aria-label={open ? `Collapse ${node.name}` : `Expand ${node.name}`}
                >
                  <ChevronIcon open={open} />
                </button>
                <Checkbox
                  checked={state === "indeterminate" ? "indeterminate" : state === "checked"}
                  onCheckedChange={(next) => onNodeToggle(node, next === true)}
                  aria-label={node.name}
                />
                <span className="truncate">{node.name}</span>
              </div>
            </li>
          );
        })}
      </ul>
    );
  },
);
CheckboxTree.displayName = "CheckboxTree";

export { CheckboxTree };
