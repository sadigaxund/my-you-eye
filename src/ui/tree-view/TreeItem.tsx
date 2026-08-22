import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CellType } from "../cell-type";
import type { UrlReplacement } from "../cell-type";
import { Input } from "../input";
import type { TreeNode } from "./TreeView";

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg viewBox="0 0 12 12" className={cn(
      "size-3.5 fill-none stroke-current text-muted shrink-0 transition-transform duration-[var(--duration-normal)] ease-[var(--ease-standard)]",
      expanded && "rotate-90",
    )}>
      <path d="M4 2l4 4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GuideColumn({ indent, drawLine, highlight }: { indent: number; drawLine: boolean; highlight: boolean }) {
  return (
    <span aria-hidden className="relative shrink-0 self-stretch" style={{ width: indent }}>
      {drawLine && (
        <span className={cn(
          "absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors duration-[var(--duration-fast)]",
          highlight ? "bg-primary/40" : "bg-border",
        )} />
      )}
    </span>
  );
}

function ElbowColumn({ indent, isLast, highlight }: { indent: number; isLast: boolean; highlight: boolean }) {
  return (
    <span aria-hidden className="relative shrink-0 self-stretch" style={{ width: indent }}>
      <span className={cn(
        "absolute left-1/2 top-0 w-px -translate-x-1/2 transition-colors duration-[var(--duration-fast)]",
        highlight ? "bg-primary/40" : "bg-border",
      )} style={{ height: isLast ? "50%" : "100%" }} />
      <span className={cn(
        "absolute left-1/2 top-1/2 h-px -translate-y-1/2 transition-colors duration-[var(--duration-fast)]",
        highlight ? "bg-primary/40" : "bg-border",
      )} style={{ width: indent / 2 }} />
    </span>
  );
}

function isArrayIndex(label: string): boolean {
  return /^\[\d+\]$/.test(label);
}

function Sigil({ kind, count }: { kind: "object" | "array"; count: number }) {
  const glyph = kind === "object" ? "{}" : "[]";
  return (
    <span className="flex items-center gap-0.5 shrink-0 font-mono text-xs text-muted">
      <span>{glyph}</span>
      <span className="text-xs">{count}</span>
    </span>
  );
}

const TONE_CLASSES = {
  default: "",
  muted: "text-muted",
  success: "text-success",
  danger: "text-danger line-through decoration-dotted",
  warning: "text-warning",
} as const;

const DROP_TARGET_CLASSES = "outline outline-2 -outline-offset-2 outline-primary bg-primary/10";

export interface TreeItemProps {
  node: TreeNode;
  depth: number;
  density: "normal" | "compact";
  indent: number;
  ancestorLines: boolean[];
  isLast: boolean;
  expanded: boolean;
  /** Keyboard-focus ring owner (#11: decoupled from selection). */
  current: boolean;
  /** Controlled selection (#11) — what aria-selected reports. */
  selected: boolean;
  hovered: boolean;
  renaming: boolean;
  draggable: boolean;
  onToggle: (id: string) => void;
  onHover: (id: string | undefined) => void;
  onSelect?: (node: TreeNode) => void;
  onRenameCommit?: (node: TreeNode, newName: string) => void;
  onRenameCancel?: () => void;
  /** Drop ONTO this row (folder targets). Descendant/refusal checks live in
   *  TreeView, which owns the whole tree and its id→node map. */
  onDropInto?: (sourceId: string, targetId: string) => void;
  replacements?: UrlReplacement[];
  children?: ReactNode;
}

const TreeItem = forwardRef<HTMLLIElement, TreeItemProps>(
  ({ node, depth, density, indent, ancestorLines, isLast, expanded, current, selected, hovered, renaming, draggable, onToggle, onHover, onSelect, onRenameCommit, onRenameCancel, onDropInto, replacements, children }, ref) => {
    const hasChildren = !!node.children?.length;
    const rawLabel = typeof node.label === "string" ? node.label : "";
    const arrIndex = isArrayIndex(rawLabel);
    const guideHighlight = hovered;
    const compact = density === "compact";
    const [dropTarget, setDropTarget] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      if (renaming) inputRef.current?.focus();
    }, [renaming]);

    const handleMouseEnter = useCallback(() => onHover(node.id), [node.id, onHover]);
    const handleMouseLeave = useCallback(() => onHover(undefined), [onHover]);

    const commitRename = () => {
      const name = inputRef.current?.value.trim() ?? "";
      if (name && name !== rawLabel) onRenameCommit?.(node, name);
      else onRenameCancel?.();
    };

    return (
      <li ref={ref} className={cn("relative", compact ? "py-px" : "py-0.5")}>
        <div
          id={node.id}
          role="treeitem"
          aria-expanded={hasChildren ? expanded : undefined}
          aria-selected={selected ? true : undefined}
          tabIndex={current ? 0 : -1}
          draggable={draggable && !renaming}
          onDragStart={(e) => {
            e.dataTransfer.setData("application/x-tree-node", node.id);
            e.dataTransfer.effectAllowed = "move";
          }}
          onDragOver={(e) => {
            if (!hasChildren || !onDropInto) return;
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
            setDropTarget(true);
          }}
          onDragLeave={() => setDropTarget(false)}
          onDrop={(e) => {
            setDropTarget(false);
            if (!hasChildren || !onDropInto) return;
            const sourceId = e.dataTransfer.getData("application/x-tree-node");
            if (sourceId && sourceId !== node.id) {
              e.preventDefault();
              onDropInto(sourceId, node.id);
            }
          }}
          className={cn(
            "group/row flex items-stretch min-w-0 rounded-ui-sm cursor-pointer outline-none",
            "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            "hover:bg-surface-hover",
            (current || selected) && "bg-surface-active",
            dropTarget && DROP_TARGET_CLASSES,
            "focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-inset",
          )}
          onClick={() => {
            if (renaming) return;
            if (hasChildren) onToggle(node.id);
            onSelect?.(node);
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {ancestorLines.map((drawLine, i) => (
            <GuideColumn key={i} indent={indent} drawLine={drawLine} highlight={guideHighlight && drawLine} />
          ))}
          {depth > 0 && <ElbowColumn indent={indent} isLast={isLast} highlight={guideHighlight} />}
          <div className={cn(
            "flex items-center gap-1.5 min-w-0 min-h-0 flex-1 pr-2",
            // Fixed grid-unit row heights (--spacing-tree-row(-compact)); see
            // AGENTS.md §7 ("never content-driven") for why this isn't
            // intrinsic. Tall values overflow past the row instead of
            // dragging the chevron/elbow anchor down with them.
            compact ? "h-tree-row-compact" : "h-tree-row",
          )}>
            {hasChildren ? (
              <Chevron expanded={expanded} />
            ) : (
              <span className="size-3.5 shrink-0" />
            )}
            {hasChildren && node.kind && (
              <Sigil kind={node.kind} count={node.children!.length} />
            )}
            {node.icon && (
              <span className="flex items-center justify-center size-4 shrink-0 text-muted [&_svg]:size-3.5">
                {node.icon}
              </span>
            )}
            {renaming ? (
              <Input
                ref={inputRef}
                size="sm"
                defaultValue={rawLabel}
                aria-label={`Rename ${rawLabel}`}
                onClick={(e) => e.stopPropagation()}
                onBlur={commitRename}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") commitRename();
                  if (e.key === "Escape") onRenameCancel?.();
                }}
                className="h-6 py-0"
              />
            ) : (
              <span className={cn(
                "text-sm leading-normal truncate flex-1 min-w-0",
                arrIndex && "font-mono text-muted text-xs",
                !arrIndex && TONE_CLASSES[node.tone ?? "default"],
              )}>{node.label}</span>
            )}
            {/* `trailing` renders BEFORE `value` so the value lands flush
                against the row's right edge every time (git-history note:
                varying trailing widths used to push badges off-alignment). */}
            {node.trailing && (
              <span className="shrink-0 text-xs text-muted tabular-nums">{node.trailing}</span>
            )}
            {node.value && (
              <span
                className="shrink min-w-0 text-right"
                // Compact rows override the chip-height tokens so badges fit
                // inside --spacing-tree-row-compact instead of overlapping
                // neighbors (same "override the var, let descendants read it"
                // pattern as Canvas's --backdrop-blur override, AGENTS §0.12).
                style={compact ? {
                  ["--density-chip-min-h" as string]: "var(--spacing-tree-row-compact)",
                  ["--density-chip-py" as string]: "0",
                } : undefined}
              >
                <CellType
                  {...node.value}
                  compact={node.value.type === "image" ? true : undefined}
                  replacements={replacements}
                />
              </span>
            )}
          </div>
        </div>
        {children}
      </li>
    );
  },
);
TreeItem.displayName = "TreeItem";

export { TreeItem };
