import { forwardRef, useCallback } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CellType } from "../cell-type";
import type { UrlReplacement } from "../cell-type";
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

export interface TreeItemProps {
  node: TreeNode;
  depth: number;
  variant: "default" | "condensed";
  indent: number;
  ancestorLines: boolean[];
  isLast: boolean;
  expanded: boolean;
  current: boolean;
  hovered: boolean;
  onToggle: (id: string) => void;
  onHover: (id: string | undefined) => void;
  replacements?: UrlReplacement[];
  children?: ReactNode;
}

const TreeItem = forwardRef<HTMLLIElement, TreeItemProps>(
  ({ node, depth, variant, indent, ancestorLines, isLast, expanded, current, hovered, onToggle, onHover, replacements, children }, ref) => {
    const hasChildren = !!node.children?.length;
    const arrIndex = isArrayIndex(node.label);
    const guideHighlight = hovered;

    const handleMouseEnter = useCallback(() => onHover(node.id), [node.id, onHover]);
    const handleMouseLeave = useCallback(() => onHover(undefined), [onHover]);

    return (
      <li ref={ref} className={cn("relative", variant === "condensed" ? "py-px" : "py-0.5")}>
        <div
          id={node.id}
          role="treeitem"
          aria-expanded={hasChildren ? expanded : undefined}
          aria-selected={current}
          tabIndex={current ? 0 : -1}
          className={cn(
            "group/row flex items-stretch min-w-0 rounded-ui-sm cursor-pointer outline-none",
            "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
            "hover:bg-surface-hover",
            current && "bg-surface-active",
            "focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-inset",
          )}
          onClick={() => hasChildren && onToggle(node.id)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {ancestorLines.map((drawLine, i) => (
            <GuideColumn key={i} indent={indent} drawLine={drawLine} highlight={guideHighlight && drawLine} />
          ))}
          {depth > 0 && <ElbowColumn indent={indent} isLast={isLast} highlight={guideHighlight} />}
          <div className={cn(
            "flex items-center gap-1.5 min-w-0 flex-1 pr-2",
            variant === "condensed" ? "py-1" : "py-1.5",
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
            <span className={cn(
              "text-sm leading-normal truncate flex-1 min-w-0",
              arrIndex && "font-mono text-muted text-xs",
            )}>{node.label}</span>
            {node.value && (
              <span className="truncate overflow-hidden shrink min-w-0 text-right">
                <CellType {...node.value} replacements={replacements} />
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
