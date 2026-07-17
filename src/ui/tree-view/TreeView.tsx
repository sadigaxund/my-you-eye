import { useState } from "react";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { CellValue } from "../cell-value";
import type { CellValueType, UrlReplacement } from "../cell-value";

export interface TreeNodeValue {
  type: CellValueType;
  value: unknown;
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
  defaultCollapsed?: boolean;
}

export interface TreeViewProps extends VariantProps<typeof treeVariants> {
  data: TreeNode[];
  indent?: number;
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
      className={cn("size-3 fill-current text-muted transition-transform", expanded && "rotate-90")}
    >
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function TreeItem({
  node,
  depth,
  variant,
  indent,
  replacements,
}: {
  node: TreeNode;
  depth: number;
  variant: "default" | "condensed";
  indent: number;
  replacements?: UrlReplacement[];
}) {
  const [collapsed, setCollapsed] = useState(node.defaultCollapsed ?? true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <li className={cn(variant === "condensed" ? "py-0" : "py-0.5")}>
      <div
        className={cn(
          "flex items-center gap-1 rounded-ui-sm px-1 py-0.5 hover:bg-secondary cursor-pointer",
        )}
        style={{ paddingLeft: `${depth * indent + 4}px` }}
        onClick={() => hasChildren && setCollapsed(!collapsed)}
      >
        {hasChildren ? (
          <Chevron expanded={!collapsed} />
        ) : (
          <span className="size-3 shrink-0" />
        )}
        {node.icon && <span className="shrink-0">{node.icon}</span>}
        <span className="text-xs truncate flex-1">{node.label}</span>
        {node.value && (
          <span className="shrink-0">
            <CellValue {...node.value} replacements={replacements} />
          </span>
        )}
      </div>
      {hasChildren && !collapsed && (
        <ul className="list-none m-0 p-0">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              variant={variant}
              indent={indent}
              replacements={replacements}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function TreeView({ data, variant = "default", indent = 16, replacements }: TreeViewProps) {
  const v = variant ?? "default";
  return (
    <ul className={cn(treeVariants({ variant: v }), "list-none m-0 p-0")}>
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          variant={v}
          indent={indent}
          replacements={replacements}
        />
      ))}
    </ul>
  );
}
