import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { TreeView } from "../../tree-view";
import type { TreeNode, TreeViewProps } from "../../tree-view";

export type FileGitStatus = "added" | "modified" | "deleted" | "untracked";

export interface FileTreeNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  /** Git-status decoration — a small colored letter badge, the same status
   * vocabulary `DiffBlock`/git porcelain use. */
  status?: FileGitStatus;
  /** Trailing metadata text — file size, line count, etc. Rendered in
   * TreeView's `trailing` slot (right-aligned, after any status badge). */
  meta?: string;
  /** Per-node icon override. Defaults to a plain folder/file glyph. */
  icon?: ReactNode;
}

export interface FileTreeProps
  extends Pick<TreeViewProps, "defaultExpandedDepth" | "expandedKeys" | "onToggle" | "density" | "indent"> {
  data: FileTreeNode[];
  className?: string;
}

function FolderIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-full fill-none stroke-current" strokeWidth="1.2">
      <path d="M1.5 3.25a.75.75 0 0 1 .75-.75h2.19l1 1H9.75a.75.75 0 0 1 .75.75v5A.75.75 0 0 1 9.75 10h-7.5a.75.75 0 0 1-.75-.75V3.25Z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-full fill-none stroke-current" strokeWidth="1.2">
      <path d="M3 1.5h4l2 2v7a.5.5 0 0 1-.5.5h-5.5a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5Z" />
      <path d="M7 1.5v2h2" />
    </svg>
  );
}

const STATUS_LETTER: Record<FileGitStatus, string> = {
  added: "A", modified: "M", deleted: "D", untracked: "U",
};
// "primary" for untracked (not yet in success/warning/danger's "already
// under version control" story) — the same 4-status vocabulary DiffBlock's
// added/removed styling draws from (bg-success/10 / bg-danger/10), extended
// with warning for modified and primary for untracked so all four read as
// distinct at a glance.
const STATUS_BADGE_VARIANT: Record<FileGitStatus, "success" | "warning" | "danger" | "primary"> = {
  added: "success", modified: "warning", deleted: "danger", untracked: "primary",
};

function toTreeNode(node: FileTreeNode): TreeNode {
  const icon = node.icon ?? (node.type === "folder" ? <FolderIcon /> : <FileIcon />);
  return {
    id: node.id,
    label: node.name,
    icon,
    children: node.children?.map(toTreeNode),
    value: node.status
      ? { type: "badge", value: STATUS_LETTER[node.status], badgeVariant: STATUS_BADGE_VARIANT[node.status], badgeStyle: "soft" }
      : undefined,
    trailing: node.meta ? <span className="font-mono">{node.meta}</span> : undefined,
  };
}

/**
 * A file/folder tree for "here's the project structure" moments in coding
 * videos — a *pattern* over `TreeView`, not a fork of it: `FileTree` only
 * shapes `FileTreeNode[]` into `TreeNode[]` (icons, a git-status badge, a
 * trailing metadata readout) and renders `TreeView` with the result. Two
 * things `TreeView` was missing for this — a per-item `trailing` slot, and
 * `CellType`'s "image" thumbnail overflowing a tree row — were fixed in
 * `TreeView`/`CellType` themselves (backwards-compatibly: both are additive,
 * opt-in changes), not worked around here.
 */
export function FileTree({ data, className, ...treeViewProps }: FileTreeProps) {
  const items = data.map(toTreeNode);
  return (
    <div className={cn(className)}>
      <TreeView data={items} {...treeViewProps} />
    </div>
  );
}
