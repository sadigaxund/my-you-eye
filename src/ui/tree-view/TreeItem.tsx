import { forwardRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { CellValue } from "../cell-value";
import type { UrlReplacement } from "../cell-value";
import type { TreeNode } from "./TreeView";

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={cn(
        "size-3.5 fill-none stroke-current text-muted shrink-0 transition-transform duration-[var(--duration-normal)] ease-[var(--ease-standard)]",
        expanded && "rotate-90",
      )}
    >
      <path d="M4 2l4 4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GuideColumn({ indent, drawLine }: { indent: number; drawLine: boolean }) {
  return (
    <span aria-hidden className="relative shrink-0 self-stretch" style={{ width: indent }}>
      {drawLine && <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border" />}
    </span>
  );
}

function ElbowColumn({ indent, isLast }: { indent: number; isLast: boolean }) {
  return (
    <span aria-hidden className="relative shrink-0 self-stretch" style={{ width: indent }}>
      <span
        className="absolute left-1/2 top-0 w-px -translate-x-1/2 bg-border"
        style={{ height: isLast ? "50%" : "100%" }}
      />
      <span
        className="absolute left-1/2 top-1/2 h-px -translate-y-1/2 bg-border"
        style={{ width: indent / 2 }}
      />
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
  onToggle: (id: string) => void;
  replacements?: UrlReplacement[];
  children?: ReactNode;
}

const TreeItem = forwardRef<HTMLLIElement, TreeItemProps>(
  ({ node, depth, variant, indent, ancestorLines, isLast, expanded, current, onToggle, replacements, children }, ref) => {
    const hasChildren = !!node.children && node.children.length > 0;

    return (
      <li
        ref={ref}
        className={cn(
          "relative",
          variant === "condensed" ? "py-px" : "py-0.5",
        )}
      >
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
        >
          {ancestorLines.map((drawLine, i) => (
            <GuideColumn key={i} indent={indent} drawLine={drawLine} />
          ))}
          {depth > 0 && <ElbowColumn indent={indent} isLast={isLast} />}
          <div
            className={cn(
              "flex items-center gap-1.5 min-w-0 flex-1 pr-2",
              variant === "condensed" ? "py-1" : "py-1.5",
            )}
          >
            {hasChildren ? (
              <Chevron expanded={expanded} />
            ) : (
              <span className="size-3.5 shrink-0" />
            )}
            {node.icon && (
              <span className="flex items-center justify-center size-4 shrink-0 text-muted [&_svg]:size-3.5">
                {node.icon}
              </span>
            )}
            <span className="text-sm leading-normal truncate flex-1 min-w-0">{node.label}</span>
            {node.value && (
              <span className="truncate overflow-hidden shrink min-w-0 text-right">
                <CellValue {...node.value} replacements={replacements} />
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
