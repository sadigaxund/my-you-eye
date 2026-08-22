// Pure tree helpers for TreeView (#11 additions) — DOM-free.

import type { TreeNode } from "./TreeView";

export interface NodeIndexEntry {
  node: TreeNode;
  parent: string | null;
}

export function computeInitialExpanded(data: TreeNode[], depth: number): Set<string> {
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

export interface VisibleEntry {
  id: string;
  parentId: string | null;
  hasChildren: boolean;
}

export function flattenVisible(nodes: TreeNode[], expanded: Set<string>, parentId: string | null, acc: VisibleEntry[]): VisibleEntry[] {
  for (const node of nodes) {
    const hasChildren = !!node.children?.length;
    acc.push({ id: node.id, parentId, hasChildren });
    if (hasChildren && expanded.has(node.id)) {
      flattenVisible(node.children!, expanded, node.id, acc);
    }
  }
  return acc;
}

export function indexNodes(
  nodes: TreeNode[],
  parentId: string | null,
  byId: Map<string, NodeIndexEntry>,
): Map<string, NodeIndexEntry> {
  for (const node of nodes) {
    byId.set(node.id, { node, parent: parentId });
    if (node.children?.length) indexNodes(node.children, node.id, byId);
  }
  return byId;
}

/** True when candidateId lies somewhere inside ancestorId's subtree. */
export function isDescendant(ancestorId: string, candidateId: string, byId: Map<string, NodeIndexEntry>): boolean {
  let cur: string | null = candidateId;
  while (cur) {
    const entry = byId.get(cur);
    if (!entry) return false;
    if (entry.parent === ancestorId) return true;
    cur = entry.parent;
  }
  return false;
}
