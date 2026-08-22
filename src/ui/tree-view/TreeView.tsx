import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { ReactNode, KeyboardEvent } from "react";
import { cn } from "../../lib/cn";
import { TreeItem } from "./TreeItem";
import { computeInitialExpanded, flattenVisible, indexNodes, isDescendant } from "./TreeView.tree-utils";
import type { CellValueType, UrlReplacement } from "../cell-type";

// Grid-unit multiples (mirrors --grid-unit in tokens.css, same mirror-constant
// pattern as GRID in src/ui/graph-node/grid.ts). Kept as plain numbers because
// GuideColumn/ElbowColumn need a JS pixel value for their inline `width` style
// and elbow-stub half-width math (indent / 2) — see AGENTS.md §0.2/§7.
const INDENT_SIZES = {
  sm: 12, // 0.75 * grid-unit
  md: 16, // 1 * grid-unit
  lg: 24, // 1.5 * grid-unit
} as const;
type IndentSize = keyof typeof INDENT_SIZES;

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
  /** ReactNode since #11 — external state (git status tint, strikethrough)
   *  can render into the row without the tree knowing about it. A bare
   *  string still behaves exactly as before (array-index sigil detection
   *  only applies to strings). */
  label: ReactNode;
  /** Row label tone (#11) — semantic-token vocabulary, applied only to
   *  string labels. `danger` strikes through (deleted-file convention). */
  tone?: "default" | "muted" | "success" | "danger" | "warning";
  value?: TreeNodeValue;
  /**
   * Trailing slot rendered after `value`, at the far end of the row — for
   * content that isn't itself a `CellType` value (e.g. `FileTree`'s file
   * size / line count readout). Purely presentational; TreeView never
   * inspects it. Additive: omitted renders byte-identical to before this
   * prop existed.
   */
  trailing?: ReactNode;
  children?: TreeNode[];
  icon?: ReactNode;
  kind?: "object" | "array";
}

export interface TreeViewProps {
  data: TreeNode[];
  /** "sm" | "md" | "lg", mapped to --grid-unit multiples (12 / 16 / 24px).
   *  A raw number is still accepted as a deprecated fallback for callers
   *  migrating off the old untyped-px API — off-grid values will misalign the
   *  guide columns, so prefer the named sizes.
   * @deprecated pass a raw number — use "sm" | "md" | "lg" instead.
   */
  indent?: IndentSize | number;
  /** @deprecated use `density` instead — "condensed" maps to density="compact". */
  variant?: "default" | "condensed";
  density?: "normal" | "compact";
  defaultExpandedDepth?: number;
  expandedKeys?: Set<string>;
  onToggle?: (id: string) => void;
  replacements?: UrlReplacement[];
  /** Merged onto the root `<ul>`. Every other component in the library takes
   * one; without it a caller can only style a tree by wrapping it in a spare
   * `<div>`, which is what `FileTree` originally had to do. */
  className?: string;

  // --- #11 additions (all optional; omitting them is the read-only mode) ---
  /** Controlled selection, decoupled from internal keyboard-focus state.
   *  aria-selected reports this; focus stays internal. */
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
  /** Render this row's label as an inline Input; commit on Enter/blur,
   *  cancel on Escape. */
  renamingId?: string | null;
  onRenameCommit?: (node: TreeNode, newName: string) => void;
  onRenameCancel?: () => void;
  /** Enable HTML5 drag-and-drop of rows onto folder rows ("into" moves). */
  draggable?: boolean;
  /** Called after a legal drop (#11). Mode: "into" (folder target),
   *  "before"/"after" (sibling insertion). Illegal drops — onto self, or
   *  anywhere inside the source's own subtree — are refused inside the
   *  tree and never reach this callback. */
  onMove?: (sourceId: string, targetId: string, mode: "into" | "before" | "after") => void;
}






interface RenderCtx {
  density: "normal" | "compact";
  indent: number;
  expanded: Set<string>;
  currentId: string | undefined;
  selectedId: string | undefined;
  hoveredId: string | undefined;
  renamingId: string | null | undefined;
  draggable: boolean;
  onToggle: (id: string) => void;
  onHover: (id: string | undefined) => void;
  onSelect?: (node: TreeNode) => void;
  onRenameCommit?: (node: TreeNode, newName: string) => void;
  onRenameCancel?: () => void;
  onDropMove?: (sourceId: string, targetId: string, mode: "into" | "before" | "after") => void;
  replacements?: UrlReplacement[];
}

function renderNodes(nodes: TreeNode[], depth: number, ancestorLines: boolean[], isLastOf: boolean[], ctx: RenderCtx): ReactNode {
  return nodes.map((node, i) => {
    const hasChildren = !!node.children?.length;
    const isExpanded = hasChildren && ctx.expanded.has(node.id);
    return (
      <TreeItem
        key={node.id}
        node={node}
        depth={depth}
        density={ctx.density}
        indent={ctx.indent}
        ancestorLines={ancestorLines}
        isLast={isLastOf[i]}
        expanded={isExpanded}
        current={node.id === ctx.currentId}
        selected={node.id === ctx.selectedId}
        hovered={node.id === ctx.hoveredId}
        renaming={node.id === ctx.renamingId}
        draggable={ctx.draggable}
        onToggle={ctx.onToggle}
        onHover={ctx.onHover}
        onSelect={ctx.onSelect}
        onRenameCommit={ctx.onRenameCommit}
        onRenameCancel={ctx.onRenameCancel}
        onDropMove={ctx.onDropMove}
        replacements={ctx.replacements}
      >
        {isExpanded && (
          <ul role="group" className="list-none m-0 p-0">
            {renderNodes(
              node.children!, depth + 1, [...ancestorLines, !isLastOf[i]],
              node.children!.map((_, j, arr) => j === arr.length - 1),
              ctx,
            )}
          </ul>
        )}
      </TreeItem>
    );
  });
}

export function TreeView({
  data, variant, density, indent = "md", defaultExpandedDepth = 1,
  expandedKeys, onToggle, replacements, className,
  selectedId, onSelect, renamingId, onRenameCommit, onRenameCancel, draggable, onMove,
}: TreeViewProps) {
  const treeRef = useRef<HTMLUListElement>(null);
  // `variant="condensed"` is the deprecated alias for `density="compact"`.
  // `density` wins if both are somehow passed.
  const d = density ?? (variant === "condensed" ? "compact" : "normal");
  const indentPx = typeof indent === "number" ? indent : INDENT_SIZES[indent];

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

  const byId = useMemo(() => indexNodes(data, null, new Map()), [data]);

  const handleSelect = useCallback((node: TreeNode) => onSelect?.(node), [onSelect]);

  const handleDrop = useCallback(
    (sourceId: string, targetId: string, mode: "into" | "before" | "after") => {
      if (!onMove) return;
      if (sourceId === targetId) return;
      // Any target inside the source's own subtree is illegal in every
      // mode — the move would carry its own ancestor along.
      if (isDescendant(sourceId, targetId, byId)) return;
      onMove(sourceId, targetId, mode);
    },
    [byId, onMove],
  );

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
      case " ": {
        e.preventDefault();
        const entry = byId.get(cur.id);
        if (cur.hasChildren) toggle(cur.id);
        if (entry) handleSelect(entry.node);
        break;
      }
    }
  }, [visible, focusIndex, expanded, toggle, byId, handleSelect]);

  useEffect(() => {
    if (visible.length === 0) return;
    const id = visible[focusIndex]?.id;
    if (!id) return;
    const el = treeRef.current?.querySelector(`[role="treeitem"][id="${CSS.escape(id)}"]`);
    if (el instanceof HTMLElement) el.focus();
  }, [focusIndex, visible]);

  // Selection (#11) is controlled and separate from keyboard focus: when no
  // selectedId is given, the focused row lights up as before (back-compat).
  const currentId = selectedId ?? visible[focusIndex]?.id;

  const ctx: RenderCtx = {
    density: d,
    indent: indentPx,
    expanded,
    currentId,
    selectedId,
    hoveredId,
    renamingId,
    draggable: Boolean(draggable),
    onToggle: toggle,
    onHover,
    onSelect: handleSelect,
    onRenameCommit,
    onRenameCancel,
    onDropMove: onMove ? handleDrop : undefined,
    replacements,
  };

  return (
    <ul
      ref={treeRef}
      role="tree"
      onKeyDown={handleKeyDown}
      className={cn(d === "compact" ? "space-y-0" : "space-y-0.5", "list-none m-0 p-0 outline-none", className)}
    >
      {renderNodes(data, 0, [], data.map((_, i, arr) => i === arr.length - 1), ctx)}
    </ul>
  );
}
