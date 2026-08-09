// The "cut a gap in the path under its own label" feature, split out of
// geometry.ts purely to keep file sizes down — this is the arc-length
// bookkeeping generatePath's route points need ONLY for that one feature,
// not for drawing the path itself. ConnectionPath.tsx is the sole consumer.

import { buildPolylineD, generatePath, getRoutePoints } from "./geometry";
import type { ConnectionVariant, PathOptions, Point } from "./geometry";

function cumulativeLengths(pts: Point[]): number[] {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) {
    lens.push(lens[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  }
  return lens;
}

function interpAtArcLength(pts: Point[], lens: number[], s: number): Point {
  for (let i = 1; i < lens.length; i++) {
    if (s <= lens[i]) {
      const segLen = lens[i] - lens[i - 1];
      const frac = segLen === 0 ? 0 : (s - lens[i - 1]) / segLen;
      const a = pts[i - 1], b = pts[i];
      return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac };
    }
  }
  return pts[pts.length - 1];
}

function sliceByArcLength(pts: Point[], lens: number[], s0: number, s1: number): Point[] {
  const total = lens[lens.length - 1];
  const start = Math.max(0, s0), end = Math.min(total, s1);
  if (end <= start) return [];
  const result: Point[] = [interpAtArcLength(pts, lens, start)];
  for (let i = 0; i < pts.length; i++) {
    if (lens[i] > start && lens[i] < end) result.push(pts[i]);
  }
  result.push(interpAtArcLength(pts, lens, end));
  return result;
}

/**
 * The route's "d" string with a gap cut out around arc-length position
 * `sLabel`, `gapHalfLen` px on either side — the "conventional diagramming
 * solution" of interrupting the edge under its own label instead of
 * relying on the label badge's opacity to hide it. Returns the plain
 * (ungapped) path when there's no label to make room for.
 */
export function generateGappedPath(
  from: Point,
  to: Point,
  variant: ConnectionVariant | string,
  sLabel: number | null,
  gapHalfLen: number,
  opts?: PathOptions,
): string {
  if (sLabel == null || gapHalfLen <= 0) return generatePath(from, to, variant, opts);
  const pts = getRoutePoints(from, to, variant as ConnectionVariant, opts);
  const lens = cumulativeLengths(pts);
  const before = sliceByArcLength(pts, lens, 0, sLabel - gapHalfLen);
  const after = sliceByArcLength(pts, lens, sLabel + gapHalfLen, lens[lens.length - 1]);
  return [buildPolylineD(before), buildPolylineD(after)].filter(Boolean).join(" ");
}

/** Total arc length of the rendered route — the same "distance" space
 * `labelPosition`'s `t` is proportional to, so callers can convert a 0–1
 * fraction into a px offset (`generateGappedPath`'s `sLabel`). */
export function getRouteLength(from: Point, to: Point, variant: ConnectionVariant | string, opts?: PathOptions): number {
  const pts = getRoutePoints(from, to, variant as ConnectionVariant, opts);
  const lens = cumulativeLengths(pts);
  return lens[lens.length - 1];
}
