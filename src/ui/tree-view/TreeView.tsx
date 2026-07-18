import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { ReactNode, KeyboardEvent } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { TreeItem } from "./TreeItem";
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
  kind?: "object" | "array";
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

interface VisibleEntry {
  id: string;
  parentId: string | null;
  hasChildren: boolean;
}

function computeInitialExpanded(data: TreeNode[], depth: number): Set<string> {
  const set = new Set<string>();
  function walk(nodes: TreeNode[], d: number) {
    for (const node of nodes) {
      if (node.children?.length && d < depth) {
        set.add(node.id);
        walk(node.children, d + 1);
      }
    }
  }
  walk(data, 0);
  return set;
}

function flattenVisible(nodes: TreeNode[], expanded: Set<string>, parentId: string | null, acc: VisibleEntry[]): VisibleEntry[] {
  for (const node of nodes) {
    const hasChildren = !!node.children?.length;
    acc.push({ id: node.id, parentId, hasChildren });
    if (hasChildren && expanded.has(node.id)) {
      flattenVisible(node.children!, expanded, node.id, acc);
    }
  }
  return acc;
}

function renderNodes(
  nodes: TreeNode[], depth: number, ancestorLines: boolean[],
  variant: "default" | "condensed", indent: number,
  expanded: Set<string>, currentId: string | undefined, hoveredId: string | undefined,
  onToggle: (id: string) => void, onHover: (id: string | undefined) => void,
  replacements: UrlReplacement[] | undefined,
): ReactNode {
  return nodes.map((node, i) => {
    const isLast = i === nodes.length - 1;
    const hasChildren = !!node.children?.length;
    const isExpanded = hasChildren && expanded.has(node.id);
    return (
      <TreeItem
        key={node.id}
        node={node}
        depth={depth}
        variant={variant}
        indent={indent}
        ancestorLines={ancestorLines}
        isLast={isLast}
        expanded={isExpanded}
        current={node.id === currentId}
        hovered={node.id === hoveredId}
        onToggle={onToggle}
        onHover={onHover}
        replacements={replacements}
      >
        {isExpanded && (
          <ul role="group" className="list-none m-0 p-0">
            {renderNodes(
              node.children!, depth + 1, [...ancestorLines, !isLast],
              variant, indent, expanded, currentId, hoveredId,
              onToggle, onHover, replacements,
            )}
          </ul>
        )}
      </TreeItem>
    );
  });
}

export function TreeView({
  data, variant = "default", indent = 16, defaultExpandedDepth = 1,
  expandedKeys, onToggle, replacements,
}: TreeViewProps) {
  const treeRef = useRef<HTMLUListElement>(null);
  const v = variant ?? "default";

  const [internalExpanded, setInternalExpanded] = useState(() =>
    computeInitialExpanded(data, defaultExpandedDepth),
  );
  const expanded = expandedKeys ?? internalExpanded;

  const toggle = useCallback((id: string) => {
    if (expandedKeys) { onToggle?.(id); return; }
    setInternalExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, [expandedKeys, onToggle]);

  const [hoveredId, setHoveredId] = useState<string | undefined>(undefined);
  const onHover = useCallback((id: string | undefined) => setHoveredId(id), []);

  const visible = useMemo(() => flattenVisible(data, expanded, null, []), [data, expanded]);
  const [focusIndex, setFocusIndex] = useState(0);

  useEffect(() => {
    if (focusIndex > visible.length - 1) setFocusIndex(Math.max(0, visible.length - 1));
  }, [visible, focusIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (visible.length === 0) return;
    const cur = visible[focusIndex];
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); setFocusIndex((i) => Math.min(i + 1, visible.length - 1)); break;
      case "ArrowUp": e.preventDefault(); setFocusIndex((i) => Math.max(i - 1, 0)); break;
      case "ArrowRight":
        e.preventDefault();
        if (cur.hasChildren && !expanded.has(cur.id)) toggle(cur.id);
        else if (cur.hasChildren) setFocusIndex((i) => Math.min(i + 1, visible.length - 1));
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (cur.hasChildren && expanded.has(cur.id)) toggle(cur.id);
        else if (cur.parentId) {
          const pIdx = visible.findIndex((entry) => entry.id === cur.parentId);
          if (pIdx >= 0) setFocusIndex(pIdx);
        }
        break;
      case "Home": e.preventDefault(); setFocusIndex(0); break;
      case "End": e.preventDefault(); setFocusIndex(visible.length - 1); break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (cur?.hasChildren) toggle(cur.id);
        break;
    }
  }, [visible, focusIndex, expanded, toggle]);

  useEffect(() => {
    if (visible.length === 0) return;
    const id = visible[focusIndex]?.id;
    if (!id) return;
    const el = treeRef.current?.querySelector(`[role="treeitem"][id="${CSS.escape(id)}"]`);
    if (el instanceof HTMLElement) el.focus();
  }, [focusIndex, visible]);

  const currentId = visible[focusIndex]?.id;

  return (
    <ul
      ref={treeRef}
      role="tree"
      onKeyDown={handleKeyDown}
      className={cn(treeVariants({ variant: v }), "list-none m-0 p-0 outline-none")}
    >
      {renderNodes(data, 0, [], v, indent, expanded, currentId, hoveredId, toggle, onHover, replacements)}
    </ul>
  );
}
