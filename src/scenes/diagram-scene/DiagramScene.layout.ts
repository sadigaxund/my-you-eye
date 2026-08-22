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
import { fitZoom } from "../../motion/camera";
import type { ConnectionKind, ConnectionVariant } from "../../ui/connection-line";
import type { DiagramNode, DiagramEdge, DiagramGroup, DiagramPreset, DiagramLayout } from "../schema";

/** Approximate footprint every diagram node reserves for layout/obstacle
 * purposes. GraphNode has no fixed width (it grows to its label), so this
 * is a heuristic clearance — the same spirit as ConnectionLine's own
 * elbow-routing margin, not an exact measurement (AGENTS.md §7 forbids
 * measuring inside a Canvas transform anyway: offsetWidth would be
 * post-zoom-irrelevant but still a second render pass we don't need here). */
export const NODE_WIDTH = 10 * GRID;

/** Clear space between two layers / two siblings, in grid units. Deliberately
 * airier than `layout.ts`'s generic defaults (4 / 3), which serve every other
 * caller: a diagram scene is composed for a 16:9 stage and is now scaled to
 * fit that stage (`fitScale`) rather than cropped by it, so buying room
 * between nodes no longer costs anything at the frame edge — and a chain of
 * boxes 3 cells apart reads as one crowded strip rather than as a diagram. */
const LAYER_GAP = 5;
const NODE_GAP = 5;

/** Vertical room a `GraphGroup`'s `labelPlacement="outside-top"` chip needs
 * above the group's own border: the chip is one line of `text-xs` in a
 * `py-0.5` pill, floated fully outside the box. Reserved in the content
 * bounds so the fit/centre step never crops it. */
export const GROUP_LABEL_BAND = 1.5 * GRID;

/** A rect in diagram (canvas) space. Unlike the node/group rects this one can
 * start at a NEGATIVE origin — a group's border, and the label band above it,
 * both sit outside the topmost node's own box. */
export interface ContentBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

  // The layout needs the real footprint to space nodes by pitch rather than
  // by gap alone. Height is the TALLEST node's band, not each node's own:
  // a layout grid has one pitch, and sizing it to the shortest node would
  // let a taller neighbour overlap the row below.
  const tallest = Math.max(...nodes.map((n) => nodeHeight(n, simple)), GRID);
  const footprint = { nodeWidth: NODE_WIDTH / GRID, nodeHeight: tallest / GRID };

  const positions =
    layoutKind === "grid"
      ? gridLayout(layoutNodes, footprint)
      : layered(layoutNodes, layoutEdges, {
          direction: layoutKind === "layered-vertical" ? "vertical" : "horizontal",
          layerGap: LAYER_GAP,
          nodeGap: NODE_GAP,
          ...footprint,
        });

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

/** Breathing room kept between the diagram's bounding box and the canvas
 * edge once it has been scaled to fit — two grid units on every side. */
export const FIT_PADDING = 2 * GRID;

/**
 * Scale that makes the whole diagram fit inside the canvas, `1` when it
 * already does. Never upscales: a two-node diagram blown up to fill a 16:9
 * stage would render nodes at three times the type scale of every other
 * scene in the same video.
 *
 * Reuses `Camera`'s own `fitZoom` (margin 1 — the clearance here is the
 * explicit `FIT_PADDING` subtracted from the viewport, not a percentage)
 * rather than restating the min-of-ratios formula, exactly as
 * `CodeScene.useCamera.ts` does for its focus rects.
 */
export function fitScale(bounds: ContentBox, canvas: { width: number; height: number }): number {
  const width = canvas.width - 2 * FIT_PADDING;
  const height = canvas.height - 2 * FIT_PADDING;
  if (width <= 0 || height <= 0) return 1;
  return Math.min(1, fitZoom({ x: 0, y: 0, width: bounds.width, height: bounds.height }, width, height, 1));
}

/**
 * Shifts every rect so the diagram sits in the MIDDLE of the canvas rather
 * than pinned to its top-left origin. Layout necessarily produces
 * origin-anchored coordinates (it has no idea how big the viewport is), and
 * a scene canvas is usually far larger than the graph — so without this the
 * whole diagram huddles in one corner of an empty frame, which is half of
 * the owner's "all nodes are bunched up on the top left of canvas".
 *
 * Two parts, in this order:
 *
 * 1. `-bounds.x` / `-bounds.y` pulls content that starts at a negative
 *    coordinate back into view. A group's dotted border sits one grid unit
 *    outside its topmost node and its `outside-top` label another band above
 *    that, so a diagram whose first node is at y=0 genuinely begins at
 *    y=-40 — without this the label is clipped by the canvas edge.
 * 2. The centring term uses the canvas measured in DIAGRAM units, i.e.
 *    divided by `zoom`: `Canvas` applies `translate(...) scale(zoom)` with a
 *    `0 0` origin, so a rect shifted by `dx` moves `dx * zoom` on screen.
 *    Dividing first is what keeps a scaled-down diagram optically centred
 *    instead of drifting toward the top-left by the scale factor.
 *
 * The centring term is clamped at 0 (a diagram wider than its canvas stays
 * flush rather than being pushed off the edge), and the total offset snaps to
 * GRID so every node stays grid-aligned (AGENTS.md §7) after centring.
 */
export function centerOffset(
  bounds: ContentBox,
  canvas: { width: number; height: number },
  zoom = 1,
): { dx: number; dy: number } {
  const scale = zoom > 0 ? zoom : 1;
  const viewWidth = canvas.width / scale;
  const viewHeight = canvas.height / scale;
  return {
    dx: snap(-bounds.x + Math.max(0, (viewWidth - bounds.width) / 2)),
    dy: snap(-bounds.y + Math.max(0, (viewHeight - bounds.height) / 2)),
  };
}

export function shiftRects<T extends { x: number; y: number }>(rects: Map<string, T>, dx: number, dy: number): Map<string, T> {
  if (dx === 0 && dy === 0) return rects;
  const out = new Map<string, T>();
  for (const [id, r] of rects) out.set(id, { ...r, x: r.x + dx, y: r.y + dy });
  return out;
}

/** Overall content bounding box (nodes ∪ groups), padded by one grid unit —
 * the coordinate space every overlay (ConnectionLayer's implicit sizing,
 * Trace's viewBox) needs to agree on, and the box `fitScale`/`centerOffset`
 * frame.
 *
 * A group contributes `GROUP_LABEL_BAND` of extra height above its own rect:
 * its label chip floats entirely outside the border (`outside-top`), so a box
 * that stopped at the border would fit the diagram to the viewport with the
 * label hanging over the edge. */
export function contentBounds(nodeRects: Map<string, NodeRect>, groupRects: Map<string, GroupRect>): ContentBox {
  const rects = [...nodeRects.values(), ...groupRects.values()];
  if (rects.length === 0) return { x: 0, y: 0, width: 4 * NODE_WIDTH, height: 8 * GRID };
  const tops = [...nodeRects.values()].map((r) => r.y).concat([...groupRects.values()].map((r) => r.y - GROUP_LABEL_BAND));
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...tops);
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));
  return { x: minX - GRID, y: minY - GRID, width: maxX - minX + 2 * GRID, height: maxY - minY + 2 * GRID };
}
