// Pure layout resolution for DiagramScene — no React, no DOM. Turns schema
// data (`DiagramNode[]`/`DiagramGroup[]`, grid-unit coordinates) into
// concrete pixel rects, using `src/lib/layout.ts`'s `layered()`/`grid()` for
// everything the author didn't pin explicitly (AGENTS.md TODO D3's whole
// point: a diagram scene must never require hand-placed coordinates to
// avoid reading as chaotic).
//
// `GRID`/`snap` come from `graph-node/grid.ts` — never redeclared (audit.mjs
// fails the build on a duplicate `const GRID = ...`).

import { GRID, snap, HEADER, FOOTER } from "../../ui/graph-node/grid";
import { layered, grid as gridLayout } from "../../lib/layout";
import type { ConnectionKind, ConnectionVariant } from "../../ui/connection-line";
import type { DiagramNode, DiagramEdge, DiagramGroup, DiagramPreset, DiagramLayout } from "../schema";

/** Approximate footprint every diagram node reserves for layout/obstacle
 * purposes. GraphNode has no fixed width (it grows to its label), so this
 * is a heuristic clearance — the same spirit as ConnectionLine's own
 * elbow-routing margin, not an exact measurement (AGENTS.md §7 forbids
 * measuring inside a Canvas transform anyway: offsetWidth would be
 * post-zoom-irrelevant but still a second render pass we don't need here). */
export const NODE_WIDTH = 12 * GRID;

export interface NodeRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: DiagramNode;
  /** Whether this node renders as GraphNode `variant="simple"` (the "state"
   * preset's pill nodes) — header/subtitle/footer/ports all suppress under
   * `simple`, so its height is always just the bare header band. */
  simple: boolean;
}

export interface PresetDefaults {
  layout: DiagramLayout;
  edgeKind: ConnectionKind;
  edgeRoute: ConnectionVariant;
  nodeShape: "box" | "pill";
}

// Picks node shape, default edge kind/route and default layout in one place
// — the preset's entire job per scenes.diagram.ts's doc comments.
export const PRESET_DEFAULTS: Record<DiagramPreset, PresetDefaults> = {
  architecture: { layout: "layered-horizontal", edgeKind: "sync", edgeRoute: "orthogonal", nodeShape: "box" },
  dataflow: { layout: "layered-horizontal", edgeKind: "data", edgeRoute: "orthogonal", nodeShape: "box" },
  state: { layout: "grid", edgeKind: "sync", edgeRoute: "bezier", nodeShape: "pill" },
  flowchart: { layout: "layered-vertical", edgeKind: "sync", edgeRoute: "stepped", nodeShape: "box" },
};

function nodeHeight(node: DiagramNode, simple: boolean): number {
  if (simple) return HEADER * GRID;
  const headerCells = node.sublabel ? HEADER + 1 : HEADER;
  const footerCells = node.metric ? FOOTER : 0;
  return (headerCells + footerCells) * GRID;
}

/** Resolves every node's pixel rect: explicit `x`/`y` (grid units → px)
 * always wins per-axis (per `layout.ts`'s own contract), everything else
 * comes from `layered()`/`grid()`. */
export function resolveNodeRects(
  nodes: DiagramNode[],
  edges: DiagramEdge[],
  preset: PresetDefaults,
  layoutOverride: DiagramLayout | undefined,
): Map<string, NodeRect> {
  const layoutKind = layoutOverride ?? preset.layout;
  const simple = preset.nodeShape === "pill";

  const layoutNodes = nodes.map((n) => ({
    id: n.id,
    x: n.x != null ? snap(n.x * GRID) : undefined,
    y: n.y != null ? snap(n.y * GRID) : undefined,
  }));
  const layoutEdges = edges.map((e) => ({ from: e.from, to: e.to }));

  const positions =
    layoutKind === "grid"
      ? gridLayout(layoutNodes)
      : layered(layoutNodes, layoutEdges, { direction: layoutKind === "layered-vertical" ? "vertical" : "horizontal" });

  const positionOf = new Map(positions.map((p) => [p.id, p]));
  const rects = new Map<string, NodeRect>();
  for (const node of nodes) {
    const pos = positionOf.get(node.id) ?? { x: 0, y: 0 };
    rects.set(node.id, { id: node.id, x: pos.x, y: pos.y, width: NODE_WIDTH, height: nodeHeight(node, simple), data: node, simple });
  }
  return rects;
}

export interface GroupRect {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: DiagramGroup;
}

/** A group's rectangle is computed from the bounds of its member nodes plus
 * a grid-unit margin — the schema gives groups no geometry on purpose
 * (scenes.diagram.ts: "a boundary region can never be drawn in the wrong
 * place or leave a node hanging outside it"). Groups with no member nodes
 * are omitted (nothing to bound). */
export function resolveGroupRects(groups: DiagramGroup[], nodeRects: Map<string, NodeRect>): Map<string, GroupRect> {
  const out = new Map<string, GroupRect>();
  for (const group of groups) {
    const members = [...nodeRects.values()].filter((r) => r.data.group === group.id);
    if (members.length === 0) continue;
    const minX = Math.min(...members.map((r) => r.x));
    const minY = Math.min(...members.map((r) => r.y));
    const maxX = Math.max(...members.map((r) => r.x + r.width));
    const maxY = Math.max(...members.map((r) => r.y + r.height));
    out.set(group.id, {
      id: group.id,
      x: minX - GRID,
      y: minY - GRID,
      width: maxX - minX + 2 * GRID,
      height: maxY - minY + 2 * GRID,
      data: group,
    });
  }
  return out;
}

/** Overall content bounding box (nodes ∪ groups), padded by one grid unit —
 * the coordinate space every overlay (ConnectionLayer's implicit sizing,
 * Trace's viewBox) needs to agree on. */
export function contentBounds(nodeRects: Map<string, NodeRect>, groupRects: Map<string, GroupRect>): { width: number; height: number } {
  const rects = [...nodeRects.values(), ...groupRects.values()];
  if (rects.length === 0) return { width: 4 * NODE_WIDTH, height: 8 * GRID };
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));
  return { width: maxX + GRID, height: maxY + GRID };
}
