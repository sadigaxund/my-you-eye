// Multi-edge layout helpers — the geometry a single edge needs no
// knowledge of, but a whole diagram does: separating parallel edges and
// finding a label position clear of every OTHER edge. Split out of
// geometry.ts (which stays the single source of truth for one edge's own
// path math) purely to keep each file under the project's line-count
// guideline — `ConnectionLayer` is the only consumer of either function
// here, and it imports both `./geometry` and `./layout` for the two
// halves of "how many edges look presentable together" (AGENTS.md TODO A4).

import { getRoutePoints, pointOnPolyline } from "./geometry";
import type { ConnectionVariant, PathOptions, Point } from "./geometry";

/**
 * Groups edges that share an endpoint pair (order-independent — A→B and B→A
 * count as the same pair) and returns a per-edge perpendicular offset (px)
 * that fans them out symmetrically around 0, so duplicate/parallel edges
 * between the same two points never render as one indistinguishable stroke.
 * Edges with a unique pair get offset 0 (untouched).
 */
export function computeBundleOffsets<T extends { from: Point; to: Point }>(edges: T[], spacing = 14): number[] {
  const keyOf = (p: Point) => `${Math.round(p.x)},${Math.round(p.y)}`;
  const pairKey = (e: T) => {
    const a = keyOf(e.from), b = keyOf(e.to);
    return a < b ? `${a}|${b}` : `${b}|${a}`;
  };
  const groups = new Map<string, number[]>();
  edges.forEach((e, i) => {
    const k = pairKey(e);
    const arr = groups.get(k);
    if (arr) arr.push(i);
    else groups.set(k, [i]);
  });
  const offsets = new Array<number>(edges.length).fill(0);
  groups.forEach((idxs) => {
    if (idxs.length < 2) return;
    idxs.forEach((edgeIdx, j) => {
      offsets[edgeIdx] = (j - (idxs.length - 1) / 2) * spacing;
    });
  });
  return offsets;
}

const DEFAULT_LABEL_T_CANDIDATES = [0.5, 0.35, 0.65, 0.25, 0.75, 0.4, 0.6];

/**
 * Picks a `labelPosition` (0–100, same units as `ConnectionLineProps.labelPosition`)
 * for an edge's label that keeps it clear of every point in `otherRoutes` —
 * dense point samples of every OTHER edge's rendered path (`getRoutePoints`).
 * Tries the midpoint first, then progressively further alternates; falls
 * back to the midpoint if nothing is fully clear (a busy diagram can't
 * always find a perfectly clean spot — the label's own opaque badge + path
 * gap under itself, both always on, are the fallback for that case).
 * `ConnectionLayer` is the only caller: it's the one place with visibility
 * into every other edge on the same canvas.
 */
export function findClearLabelT(
  from: Point,
  to: Point,
  variant: ConnectionVariant | string,
  opts: PathOptions | undefined,
  otherRoutes: Point[][],
  minClearance = 18,
): number {
  const pts = getRoutePoints(from, to, variant as ConnectionVariant, opts);
  if (otherRoutes.length === 0) return DEFAULT_LABEL_T_CANDIDATES[0] * 100;
  for (const t of DEFAULT_LABEL_T_CANDIDATES) {
    const p = pointOnPolyline(pts, t);
    const clear = otherRoutes.every((route) =>
      route.every((q) => Math.hypot(q.x - p.x, q.y - p.y) >= minClearance),
    );
    if (clear) return t * 100;
  }
  return DEFAULT_LABEL_T_CANDIDATES[0] * 100;
}
