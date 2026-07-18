import { useState, useCallback, useRef, useEffect } from "react";
import type { ReactNode, KeyboardEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { CellValue } from "../cell-value";
import type { CellValueType, UrlReplacement } from "../cell-value";

export interface TreeNodeValue {
  type: CellValueType;
  value?: unknown;
  badgeVariant?: "neutral" | "primary" | "success" | "warning" | "danger";
  badgeStyle?: "solid" | "soft";
  statusVariant?: "neutral" | "success" | "warning" | "danger" | "info";
  statusPulse?: boolean;
}

export interface TreeNode {
  id: string;
  label: string;
  value?: TreeNodeValue;
  children?: TreeNode[];
  icon?: ReactNode;
}

export interface TreeViewProps extends VariantProps<typeof treeVariants> {
  data: TreeNode[];
  indent?: number;
  defaultExpandedDepth?: number;
  expandedKeys?: Set<string>;
  onToggle?: (id: string) => void;
  replacements?: UrlReplacement[];
}

const treeVariants = cva("", {
  variants: {
    variant: {
      default: "space-y-0.5",
      condensed: "space-y-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={cn("size-3 fill-current text-muted transition-transform shrink-0", expanded && "rotate-90")}
    >
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function isExpanded(
  nodeId: string,
  depth: number,
  defaultExpandedDepth: number,
  controlledExpanded?: Set<string>,
): boolean {
  if (controlledExpanded) return controlledExpanded.has(nodeId);
  return depth < defaultExpandedDepth;
}

function flattenIds(data: TreeNode[]): string[] {
  const ids: string[] = [];
  for (const node of data) {
    ids.push(node.id);
    if (node.children) ids.push(...flattenIds(node.children));
  }
  return ids;
}

function TreeItem({
  node,
  depth,
  variant,
  indent,
  defaultExpandedDepth,
  controlledExpanded,
  onToggle,
  replacements,
  isLast,
}: {
  node: TreeNode;
  depth: number;
  variant: "default" | "condensed";
  indent: number;
  defaultExpandedDepth: number;
  controlledExpanded?: Set<string>;
  onToggle?: (id: string) => void;
  replacements?: UrlReplacement[];
  isLast: boolean;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const expanded = isExpanded(node.id, depth, defaultExpandedDepth, controlledExpanded);
  const [internalExpanded, setInternalExpanded] = useState(expanded);

  const actuallyExpanded = controlledExpanded ? expanded : internalExpanded;

  const toggle = useCallback(() => {
    if (!hasChildren) return;
    if (controlledExpanded) {
      onToggle?.(node.id);
    } else {
      setInternalExpanded((e) => !e);
    }
  }, [hasChildren, controlledExpanded, onToggle, node.id]);

  const itemRef = useRef<HTMLLIElement>(null);

  return (
    <li
      ref={itemRef}
      role="treeitem"
      aria-expanded={hasChildren ? actuallyExpanded : undefined}
      className={cn(
        "relative",
        variant === "condensed" ? "py-0" : "py-0.5",
      )}
    >
      {depth > 0 && (
        <span
          className="absolute top-0 border-l border-border pointer-events-none"
          style={{ left: `${depth * indent - 8}px`, height: isLast ? "50%" : "100%" }}
        />
      )}
      {depth > 0 && (
        <span
          className="absolute border-t border-border pointer-events-none"
          style={{ left: `${depth * indent - 8}px`, width: "8px", top: "50%" }}
        />
      )}
      <div
        className={cn(
          "flex items-center gap-1 rounded-ui-sm px-1 py-0.5 hover:bg-secondary cursor-pointer relative",
        )}
        style={{ paddingLeft: `${depth * indent + 4}px` }}
        onClick={toggle}
      >
        {hasChildren ? (
          <Chevron expanded={actuallyExpanded} />
        ) : (
          <span className="size-3 shrink-0" />
        )}
        {node.icon && <span className="shrink-0">{node.icon}</span>}
        <span className="text-xs truncate flex-1">{node.label}</span>
        {node.value && (
          <span>
            <CellValue {...node.value} replacements={replacements} />
          </span>
        )}
      </div>
      {hasChildren && actuallyExpanded && (
        <ul role="group" className="list-none m-0 p-0">
          {node.children!.map((child, ci) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              variant={variant}
              indent={indent}
              defaultExpandedDepth={defaultExpandedDepth}
              controlledExpanded={controlledExpanded}
              onToggle={onToggle}
              replacements={replacements}
              isLast={ci === node.children!.length - 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeView({
  data,
  variant = "default",
  indent = 16,
  defaultExpandedDepth = 1,
  expandedKeys,
  onToggle,
  replacements,
}: TreeViewProps) {
  const treeRef = useRef<HTMLUListElement>(null);
  const flatIds = useRef<string[]>([]);
  flatIds.current = flattenIds(data);
  const [focusIndex, setFocusIndex] = useState(0);

  const v = variant ?? "default";

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ids = flatIds.current;
    if (ids.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusIndex((i) => Math.min(i + 1, ids.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusIndex((i) => Math.max(i - 1, 0));
        break;
      case "ArrowRight":
        e.preventDefault();
        onToggle?.(ids[focusIndex]);
        break;
      case "ArrowLeft":
        e.preventDefault();
        onToggle?.(ids[focusIndex]);
        break;
      case "Home":
        e.preventDefault();
        setFocusIndex(0);
        break;
      case "End":
        e.preventDefault();
        setFocusIndex(ids.length - 1);
        break;
    }
  }, [focusIndex, onToggle]);

  useEffect(() => {
    if (flatIds.current.length === 0) return;
    const id = flatIds.current[focusIndex];
    const el = treeRef.current?.querySelector(`[role="treeitem"][id="${id}"]`);
    if (el instanceof HTMLElement) el.focus();
  }, [focusIndex]);

  return (
    <ul
      ref={treeRef}
      role="tree"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(treeVariants({ variant: v }), "list-none m-0 p-0 outline-none")}
    >
      {data.map((node, i) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          variant={v}
          indent={indent}
          defaultExpandedDepth={defaultExpandedDepth}
          controlledExpanded={expandedKeys}
          onToggle={onToggle}
          replacements={replacements}
          isLast={i === data.length - 1}
        />
      ))}
    </ul>
  );
}
