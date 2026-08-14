// Pure graph-layout helpers — no React, no DOM, no dependencies. The point
// (per TODO.md Q3 / the repo owner's own framing): weaker models "create
// nodes, and just wire up the lines without any care about how it will
// look." ConnectionLine's routing makes individual edges behave; these
// functions make automatic *placement* good enough that a diagram scene
// doesn't need hand-placed coordinates to avoid reading as chaotic.
//
// `GRID` is imported from graph-node/grid.ts, never redeclared here
// (scripts/audit.mjs fails the build on a duplicate `const GRID = ...`).

import { GRID, snap } from "../ui/graph-node/grid";

export interface LayoutNode {
  id: string;
  /** Explicit position. Always wins over the computed layout, per-axis
   * independently (you can pin `x` and still let `y` be computed). */
  x?: number;
  y?: number;
}

export interface LayoutEdge {
  from: string;
  to: string;
}

export interface LayoutPosition {
  id: string;
  x: number;
  y: number;
}

export interface LayeredOptions {
  /** "horizontal" (default): rank flows left→right (rank picks x). "vertical": rank flows top→bottom (rank picks y). */
  direction?: "horizontal" | "vertical";
  /** Gap between ranks/layers, in grid units (× GRID px). Default 4. */
  layerGap?: number;
  /** Gap between nodes within a layer, in grid units (× GRID px). Default 3. */
  nodeGap?: number;
  /** Footprint one node occupies, in grid units. Added to the gaps to get
   * the placement PITCH — see the note on `NODE_W`/`NODE_H` below. */
  nodeWidth?: number;
  nodeHeight?: number;
  /** Barycenter ordering passes (alternating forward/backward sweeps). 0 skips
   * ordering entirely, leaving each layer in its naive input order — useful
   * to measure the *before* state (see scripts/prove-layout-crossings.mjs).
   * Default 4. */
  iterations?: number;
}

export interface GridOptions {
  /** Column count. Default: ceil(sqrt(nodes.length)). */
  columns?: number;
  /** Horizontal gap between columns, in grid units (× GRID px). Default 6. */
  columnGap?: number;
  /** Vertical gap between rows, in grid units (× GRID px). Default 4. */
  rowGap?: number;
  /** Footprint one node occupies, in grid units. Added to the gaps to get
   * the placement PITCH — see the note on `NODE_W`/`NODE_H` below. */
  nodeWidth?: number;
  nodeHeight?: number;
}

// Default node footprint, in grid units. These exist because every gap
// option here is a GAP — the clear space BETWEEN two nodes — and a position
// is therefore `index * (nodeSize + gap)`, not `index * gap`.
//
// Treating a gap as the whole pitch is what made every DiagramScene render
// with its nodes piled in the top-left corner: layers sat 4 cells (64px)
// apart while a diagram node is 12 cells (192px) wide, so consecutive
// layers overlapped by 128px and the entire graph collapsed into roughly
// one node's worth of space. Callers that know their real node size should
// pass it; these defaults match DiagramScene's own NODE_WIDTH and its
// tallest node band so the common case is right without being told.
const DEFAULT_NODE_W = 12;
const DEFAULT_NODE_H = 4;

const DEFAULT_LAYER_GAP = 4;
const DEFAULT_NODE_GAP = 3;
const DEFAULT_ITERATIONS = 4;
const DEFAULT_COLUMN_GAP = 6;
const DEFAULT_ROW_GAP = 4;

/**
 * Longest-path rank assignment over a DAG (Kahn's algorithm, tracking the
 * longest incoming path rather than just topological order — a node's rank
 * is one past the max rank of any predecessor). Assumes a DAG; a cyclic
 * input is still handled — any remaining unranked nodes once no node has
 * zero remaining in-degree form a cycle, which is broken by ranking the
 * node with the fewest unresolved predecessors next (least-disruptive cut),
 * then continuing. This keeps the function total (it always terminates
 * with every node ranked) rather than throwing on cyclic input.
 */
function assignRanks(nodes: LayoutNode[], edges: LayoutEdge[]): Map<string, number> {
  const successors = new Map<string, string[]>();
  const remainingIndegree = new Map<string, number>();
  for (const n of nodes) { successors.set(n.id, []); remainingIndegree.set(n.id, 0); }
  for (const e of edges) {
    successors.get(e.from)?.push(e.to);
    remainingIndegree.set(e.to, (remainingIndegree.get(e.to) ?? 0) + 1);
  }

  const rank = new Map<string, number>();
  const unranked = new Set(nodes.map((n) => n.id));
  const queue: string[] = [];
  for (const id of unranked) if (remainingIndegree.get(id) === 0) queue.push(id);

  function settle(id: string, r: number) {
    rank.set(id, r);
    unranked.delete(id);
    for (const succ of successors.get(id) ?? []) {
      rank.set(succ, Math.max(rank.get(succ) ?? 0, r + 1));
      const left = (remainingIndegree.get(succ) ?? 0) - 1;
      remainingIndegree.set(succ, left);
      if (left === 0 && unranked.has(succ)) queue.push(succ);
    }
  }

  while (unranked.size > 0) {
    if (queue.length === 0) {
      let pick: string | null = null;
      let min = Infinity;
      for (const id of unranked) {
        const d = remainingIndegree.get(id) ?? 0;
        if (d < min) { min = d; pick = id; }
      }
      const seedRank = rank.size > 0 ? Math.max(...rank.values()) + 1 : 0;
      settle(pick as string, Math.max(rank.get(pick as string) ?? 0, seedRank));
      continue;
    }
    const id = queue.shift() as string;
    if (!unranked.has(id)) continue;
    settle(id, rank.get(id) ?? 0);
  }
  return rank;
}

function groupByRank(nodes: LayoutNode[], rank: Map<string, number>): string[][] {
  const maxRank = nodes.length > 0 ? Math.max(...nodes.map((n) => rank.get(n.id) ?? 0)) : -1;
  const layers: string[][] = Array.from({ length: maxRank + 1 }, () => []);
  for (const n of nodes) layers[rank.get(n.id) ?? 0].push(n.id);
  return layers;
}

function barycenterOf(neighbors: string[], refPos: Map<string, number>): number | null {
  const positions: number[] = [];
  for (const n of neighbors) {
    const p = refPos.get(n);
    if (p != null) positions.push(p);
  }
  if (positions.length === 0) return null;
  return positions.reduce((a, b) => a + b, 0) / positions.length;
}

/**
 * In-place barycenter/median-style crossing reduction: alternating forward
 * (order layer i by the average position of its predecessors in layer i-1)
 * and backward (order layer i by the average position of its successors in
 * layer i+1) sweeps, `iterations` passes total. A node with no neighbors in
 * the reference layer keeps its current index (stable — doesn't get
 * shuffled by nodes that have no opinion about where it should sit).
 */
function orderLayers(layers: string[][], edges: LayoutEdge[], iterations: number): void {
  const predecessorsOf = new Map<string, string[]>();
  const successorsOf = new Map<string, string[]>();
  for (const layer of layers) for (const id of layer) { predecessorsOf.set(id, []); successorsOf.set(id, []); }
  for (const e of edges) {
    if (!successorsOf.has(e.from) || !predecessorsOf.has(e.to)) continue;
    successorsOf.get(e.from)?.push(e.to);
    predecessorsOf.get(e.to)?.push(e.from);
  }

  for (let iter = 0; iter < iterations; iter++) {
    const forward = iter % 2 === 0;
    for (let step = 0; step < layers.length - 1; step++) {
      const layerIndex = forward ? step + 1 : layers.length - 2 - step;
      const refLayerIndex = forward ? layerIndex - 1 : layerIndex + 1;
      const refPos = new Map<string, number>();
      layers[refLayerIndex].forEach((id, i) => refPos.set(id, i));
      const neighborsOf = forward ? predecessorsOf : successorsOf;
      const scored = layers[layerIndex].map((id, i) => ({
        id,
        key: barycenterOf(neighborsOf.get(id) ?? [], refPos) ?? i,
        originalIndex: i,
      }));
      scored.sort((a, b) => a.key - b.key || a.originalIndex - b.originalIndex);
      layers[layerIndex] = scored.map((s) => s.id);
    }
  }
}

/**
 * Counts edge crossings between each pair of adjacent layers (the
 * crossings a barycenter pass over that boundary can actually influence).
 * Two edges (a→b) and (c→d), both connecting the same pair of layers,
 * cross iff their endpoints are in opposite relative order in the two
 * layers. Exported so a caller can measure a custom ordering, not just
 * `layered`'s own output — see scripts/prove-layout-crossings.mjs.
 */
export function countCrossings(layers: string[][], edges: LayoutEdge[]): number {
  let total = 0;
  for (let i = 0; i < layers.length - 1; i++) {
    const posA = new Map(layers[i].map((id, idx) => [id, idx]));
    const posB = new Map(layers[i + 1].map((id, idx) => [id, idx]));
    const boundaryEdges: [number, number][] = [];
    for (const e of edges) {
      const a = posA.get(e.from);
      const b = posB.get(e.to);
      if (a != null && b != null) boundaryEdges.push([a, b]);
    }
    for (let x = 0; x < boundaryEdges.length; x++) {
      for (let y = x + 1; y < boundaryEdges.length; y++) {
        const [a1, a2] = boundaryEdges[x];
        const [b1, b2] = boundaryEdges[y];
        if ((a1 - b1) * (a2 - b2) < 0) total++;
      }
    }
  }
  return total;
}

/**
 * DAG layer assignment (longest-path ranking) plus within-layer ordering
 * that reduces edge crossings (barycenter heuristic). Self-loops and edges
 * referencing an id outside `nodes` are ignored. Explicit `x`/`y` on a node
 * always wins, per-axis, over the computed position.
 */
export function layered(nodes: LayoutNode[], edges: LayoutEdge[], opts: LayeredOptions = {}): LayoutPosition[] {
  const direction = opts.direction ?? "horizontal";
  const nodeW = (opts.nodeWidth ?? DEFAULT_NODE_W) * GRID;
  const nodeH = (opts.nodeHeight ?? DEFAULT_NODE_H) * GRID;
  // Pitch, not gap: the main axis advances by one node's extent along that
  // axis plus the gap, and likewise across.
  const mainSize = direction === "horizontal" ? nodeW : nodeH;
  const crossSize = direction === "horizontal" ? nodeH : nodeW;
  const layerPitch = mainSize + (opts.layerGap ?? DEFAULT_LAYER_GAP) * GRID;
  const nodePitch = crossSize + (opts.nodeGap ?? DEFAULT_NODE_GAP) * GRID;
  const iterations = opts.iterations ?? DEFAULT_ITERATIONS;

  const ids = new Set(nodes.map((n) => n.id));
  const validEdges = edges.filter((e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to);

  const rank = assignRanks(nodes, validEdges);
  const layers = groupByRank(nodes, rank);
  orderLayers(layers, validEdges, iterations);

  const layerIndexOf = new Map<string, number>();
  layers.forEach((layer, i) => layer.forEach((id) => layerIndexOf.set(id, i)));

  return nodes.map((node) => {
    const layerIndex = layerIndexOf.get(node.id) ?? 0;
    const indexInLayer = layers[layerIndex].indexOf(node.id);
    const mainAxis = snap(layerIndex * layerPitch);
    const crossAxis = snap(indexInLayer * nodePitch);
    const computedX = direction === "horizontal" ? mainAxis : crossAxis;
    const computedY = direction === "horizontal" ? crossAxis : mainAxis;
    return { id: node.id, x: node.x ?? computedX, y: node.y ?? computedY };
  });
}

/** Simple row-major grid placement. Explicit `x`/`y` on a node always wins, per-axis. */
export function grid(nodes: LayoutNode[], opts: GridOptions = {}): LayoutPosition[] {
  const columns = opts.columns ?? Math.max(1, Math.ceil(Math.sqrt(nodes.length)));
  // Pitch, not gap — same reasoning as `layered`.
  const columnPitch = (opts.nodeWidth ?? DEFAULT_NODE_W) * GRID + (opts.columnGap ?? DEFAULT_COLUMN_GAP) * GRID;
  const rowPitch = (opts.nodeHeight ?? DEFAULT_NODE_H) * GRID + (opts.rowGap ?? DEFAULT_ROW_GAP) * GRID;

  return nodes.map((node, i) => {
    const col = i % columns;
    const row = Math.floor(i / columns);
    return {
      id: node.id,
      x: node.x ?? snap(col * columnPitch),
      y: node.y ?? snap(row * rowPitch),
    };
  });
}
