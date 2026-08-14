// Pure path/geometry math shared by ConnectionLine (single edge, standalone
// <svg>) and ConnectionLayer (many edges, one shared <svg>) — the single
// source of truth referenced throughout AGENTS.md/TODO.md as "ConnectionPath".
// No JSX, no React: this file only computes points and "d" strings. See
// ConnectionPath.tsx for the shared rendering component that consumes it.
//
// Nothing here is duplicated between the two consumers — ConnectionLine.tsx
// and ConnectionLayer.tsx both import exclusively from this module.

export type Point = { x: number; y: number };

export type ConnectionVariant = "bezier" | "stepped" | "straight" | "orthogonal";

/** Semantic edge styling, independent of interaction `state` — see
 * ConnectionPath.tsx's `KIND_STYLES`. */
export type ConnectionKind = "sync" | "async" | "data" | "error";

/** Axis-aligned rect an `orthogonal` route should not pass through (e.g. a
 * GraphNode's bounding box). Coordinates share the same space as `from`/`to`. */
export interface ObstacleRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PathOptions {
  /** Points the route must pass through, in order, between `from` and `to`. */
  waypoints?: Point[];
  /** Rects an `orthogonal` route detours around. Ignored by other variants. */
  obstacles?: ObstacleRect[];
  /** Perpendicular displacement (px) applied to the whole route — how
   * `computeBundleOffsets` visually separates edges that share an endpoint
   * pair, so parallel/duplicate edges don't render as one indistinguishable
   * stroke. */
  offset?: number;
  /** Outward normal at `from`/`to` — set by `resolveEnds` when that end was
   * given as a shape. A bezier leaves and arrives along these instead of
   * always horizontally, which is what makes the curve look attached to the
   * side it touches rather than merely ending near it. Absent (the bare-point
   * case) reproduces the previous horizontal-tangent behaviour exactly. */
  fromNormal?: Point;
  toNormal?: Point;
}

// Matches GraphNode's GRID unit intentionally (not imported directly, to
// keep connection-line decoupled from graph-node) — the natural clearance
// for routing around a grid-aligned node without hugging its border.
const DEFAULT_CLEARANCE = 16;

function unitNormal(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: -dy / len, y: dx / len };
}

/** Applies the bundle `offset` (if any) to every point in the chain, and
 * returns the resolved `[from, ...waypoints, to]` chain — the single place
 * every variant reads its actual routing points from. */
function resolveChain(from: Point, to: Point, opts?: PathOptions): Point[] {
  const chain = [from, ...(opts?.waypoints ?? []), to];
  if (!opts?.offset) return chain;
  const n = unitNormal(from, to);
  const off = opts.offset;
  return chain.map((p) => ({ x: p.x + n.x * off, y: p.y + n.y * off }));
}

/** Shared control-point rule for a single bezier segment — the closed-form
 * cubic both path generation and point-at-t evaluation read from, so they
 * can never drift apart. */
function bezierControlPoints(from: Point, to: Point, fromNormal?: Point, toNormal?: Point) {
  // No normals => bare-point endpoints, and the original always-horizontal
  // tangents are reproduced exactly. Kept as its own branch rather than
  // folded into the general case so this stays provably unchanged for every
  // call site that predates `anchors.ts`.
  if (!fromNormal && !toNormal) {
    const cp = Math.max(Math.abs(to.x - from.x) * 0.5, 30);
    return { p0: from, p1: { x: from.x + cp, y: from.y }, p2: { x: to.x - cp, y: to.y }, p3: to };
  }
  // The handle length scales with the true endpoint distance, not just its x
  // component: an anchored edge is routinely vertical (bottom -> top), where
  // dx is 0 and an x-derived handle would flatten the curve to the 30px
  // floor regardless of how far apart the shapes actually are.
  const cp = Math.max(Math.hypot(to.x - from.x, to.y - from.y) * 0.4, 30);
  const nf = fromNormal ?? { x: 1, y: 0 };
  const nt = toNormal ?? { x: -1, y: 0 };
  return {
    p0: from,
    p1: { x: from.x + nf.x * cp, y: from.y + nf.y * cp },
    p2: { x: to.x + nt.x * cp, y: to.y + nt.y * cp },
    p3: to,
  };
}

/** Normals apply only where the route actually meets a shape — the first
 * segment's start and the last segment's end. Intermediate waypoint joins
 * keep the default tangents so a pinned route still reads as one curve. */
function segNormals(opts: PathOptions | undefined, i: number, lastIndex: number) {
  return [i === 0 ? opts?.fromNormal : undefined, i === lastIndex ? opts?.toNormal : undefined] as const;
}

function sampleCubic(p0: Point, p1: Point, p2: Point, p3: Point, steps = 32): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const inv = 1 - u;
    const a = inv * inv * inv, b = 3 * inv * inv * u, c = 3 * inv * u * u, d = u * u * u;
    pts.push({ x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y });
  }
  return pts;
}

// Strict inequalities on purpose: `elbowPoints`' tier-2 candidates are
// computed as exactly `blocker.x - margin` / `blocker.x + blocker.width +
// margin` — i.e. exactly on this function's own boundary. An inclusive
// `>=`/`<=` would make a candidate re-check itself as still blocked (it IS
// the boundary), so tier 2 could never succeed and every route would fall
// through to tier 3's detour even when sliding sideways was enough.
function rectBlocksVerticalSpan(x: number, y0: number, y1: number, o: ObstacleRect, margin: number): boolean {
  const top = Math.min(y0, y1), bottom = Math.max(y0, y1);
  const ox0 = o.x - margin, ox1 = o.x + o.width + margin;
  const oy0 = o.y - margin, oy1 = o.y + o.height + margin;
  return x > ox0 && x < ox1 && bottom > oy0 && top < oy1;
}

/** Same test as `rectBlocksVerticalSpan`, axes swapped: does the horizontal
 * segment at `y` spanning `x0..x1` cross `o`? Needed alongside the vertical
 * check because `elbowPoints`' candidate columns aren't the whole story —
 * see `elbowBlockedByRect`. */
function rectBlocksHorizontalSpan(y: number, x0: number, x1: number, o: ObstacleRect, margin: number): boolean {
  const left = Math.min(x0, x1), right = Math.max(x0, x1);
  const ox0 = o.x - margin, ox1 = o.x + o.width + margin;
  const oy0 = o.y - margin, oy1 = o.y + o.height + margin;
  return y > oy0 && y < oy1 && right > ox0 && left < ox1;
}

/**
 * Does the full elbow `a → (cx, a.y) → (cx, b.y) → b` cross `o` at all?
 * Checking only the vertical spine (`rectBlocksVerticalSpan(cx, a.y, b.y,
 * …)`) is not sufficient: for a flat edge (`a.y === b.y`) the "vertical"
 * segment has zero height, so the spine check degenerates to testing a
 * single point, while the two horizontal legs — which for a flat edge
 * both actually run the FULL width at `a.y`/`b.y` — are exactly what the
 * naive check skipped. A candidate `cx` sitting just past one edge of the
 * obstacle can pass the point-check yet still leave the *other* leg
 * running straight through the obstacle's x-range at that same y — the
 * elbow "jog" doesn't jog at all when there's no vertical travel to jog
 * along. Checking all three segments (both legs + the spine) is what
 * makes `elbowPoints` correct for flat edges, not just diagonal ones.
 */
function elbowBlockedByRect(a: Point, b: Point, cx: number, o: ObstacleRect, margin: number): boolean {
  return (
    rectBlocksHorizontalSpan(a.y, a.x, cx, o, margin) ||
    rectBlocksVerticalSpan(cx, a.y, b.y, o, margin) ||
    rectBlocksHorizontalSpan(b.y, cx, b.x, o, margin)
  );
}

/**
 * Right-angle route between exactly two points, detouring around any
 * `obstacles` that block the naive mid-X elbow (the same shape `stepped`
 * always uses). Three tiers, cheapest first:
 *  1. No obstacles in the way → the plain mid-X elbow.
 *  2. Slide the elbow's vertical spine to just outside whichever obstacle
 *     blocks it, preferring the side closest to the original spine.
 *  3. Every vertical spine is blocked (the obstacle spans the whole
 *     corridor) → detour over the top or under the bottom of every
 *     relevant obstacle, whichever is the shorter detour.
 * This is a heuristic, not a general-purpose maze router — it's tuned for
 * the common diagram case of a few axis-aligned node rects between two
 * ports, which is what `obstacles` is documented to be.
 */
function elbowPoints(a: Point, b: Point, obstacles: ObstacleRect[] = [], margin = DEFAULT_CLEARANCE): Point[] {
  const midX = (a.x + b.x) / 2;
  if (obstacles.length === 0) return [a, { x: midX, y: a.y }, { x: midX, y: b.y }, b];
  const blocker = obstacles.find((o) => elbowBlockedByRect(a, b, midX, o, margin));
  if (!blocker) return [a, { x: midX, y: a.y }, { x: midX, y: b.y }, b];
  const spread = Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y)) + margin * 4;
  const candidates = [blocker.x - margin, blocker.x + blocker.width + margin]
    .filter((x) => Math.abs(x - midX) <= spread)
    .sort((x1, x2) => Math.abs(x1 - midX) - Math.abs(x2 - midX));
  for (const cx of candidates) {
    if (!obstacles.some((o) => elbowBlockedByRect(a, b, cx, o, margin))) {
      return [a, { x: cx, y: a.y }, { x: cx, y: b.y }, b];
    }
  }

  const relevant = obstacles.filter(
    (o) => o.x < Math.max(a.x, b.x) + margin && o.x + o.width > Math.min(a.x, b.x) - margin,
  );
  if (relevant.length === 0) return [a, { x: midX, y: a.y }, { x: midX, y: b.y }, b];
  const top = Math.min(...relevant.map((o) => o.y)) - margin;
  const bottom = Math.max(...relevant.map((o) => o.y + o.height)) + margin;
  const overCost = Math.abs(a.y - top) + Math.abs(b.y - top);
  const underCost = Math.abs(a.y - bottom) + Math.abs(b.y - bottom);
  const routeY = overCost <= underCost ? top : bottom;
  return [a, { x: a.x, y: routeY }, { x: b.x, y: routeY }, b];
}

/** Dense point approximation of the full route, used for arc-length walks
 * (labels, the own-label path gap) and for the exact "d" string of the
 * piecewise-linear variants. `bezier` is sampled per segment so a
 * multi-waypoint bezier still resolves to a proportional arc-length walk;
 * its "d" string is generated separately (`generatePath`) as real cubic
 * commands so the rendered curve stays crisp rather than faceted. */
export function getRoutePoints(from: Point, to: Point, variant: ConnectionVariant, opts?: PathOptions): Point[] {
  const chain = resolveChain(from, to, opts);
  if (variant === "straight") return chain;
  if (variant === "stepped" || variant === "orthogonal") {
    const obstacles = variant === "orthogonal" ? opts?.obstacles ?? [] : [];
    const pts: Point[] = [chain[0]];
    for (let i = 0; i < chain.length - 1; i++) pts.push(...elbowPoints(chain[i], chain[i + 1], obstacles).slice(1));
    return pts;
  }
  // bezier
  const pts: Point[] = [];
  for (let i = 0; i < chain.length - 1; i++) {
    const [nf, nt] = segNormals(opts, i, chain.length - 2);
    const { p0, p1, p2, p3 } = bezierControlPoints(chain[i], chain[i + 1], nf, nt);
    const seg = sampleCubic(p0, p1, p2, p3);
    pts.push(...(i === 0 ? seg : seg.slice(1)));
  }
  return pts;
}

export function buildPolylineD(pts: Point[]): string {
  if (pts.length === 0) return "";
  return `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p) => `L ${p.x} ${p.y}`).join(" ");
}

/** The exact SVG "d" string for a route. `bezier` emits real `C` commands
 * (chained per waypoint segment) so the curve renders smoothly regardless of
 * sample density; every other variant is genuinely piecewise-linear, so its
 * exact vertices ARE the path. */
export function generatePath(from: Point, to: Point, variant: ConnectionVariant | string, opts?: PathOptions): string {
  const chain = resolveChain(from, to, opts);
  const v = variant as ConnectionVariant;
  if (v === "straight") return buildPolylineD(chain);
  if (v === "stepped" || v === "orthogonal") {
    const obstacles = v === "orthogonal" ? opts?.obstacles ?? [] : [];
    const pts: Point[] = [chain[0]];
    for (let i = 0; i < chain.length - 1; i++) pts.push(...elbowPoints(chain[i], chain[i + 1], obstacles).slice(1));
    return buildPolylineD(pts);
  }
  // bezier
  let d = `M ${chain[0].x} ${chain[0].y} `;
  for (let i = 0; i < chain.length - 1; i++) {
    const [nf, nt] = segNormals(opts, i, chain.length - 2);
    const { p1, p2, p3 } = bezierControlPoints(chain[i], chain[i + 1], nf, nt);
    d += `C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${p3.x} ${p3.y} `;
  }
  return d.trim();
}

/**
 * Arrowhead polygon in "arrow space": the tip sits at the LOCAL ORIGIN and
 * the body extends backwards along -x, so `translate(to) rotate(angle)`
 * lands the tip exactly on `to` — the route's own endpoint, and the point
 * every anchor/border calculation already targets.
 *
 * The obvious-looking `0,-4 8,0 0,4` (base at the origin, tip 8px *past*
 * it) is wrong for every real diagram: `to` is a point on the target node's
 * border, so a tip 8px beyond it visibly penetrates the node, and the
 * marker reads as appended after the line rather than as its termination.
 * Shared by `ConnectionPath` and `Annotation` so the two can't drift.
 */
export const ARROWHEAD_POINTS = "-8,-4 0,0 -8,4";

/** Rotation (degrees) for an arrowhead at `to`. With no waypoints, this
 * preserves each variant's original, hand-tuned behavior exactly (bezier
 * always points along +x — the curve's true end tangent was never modeled).
 * With waypoints, every variant instead uses the direction of the route's
 * final segment, which is unambiguous once there's a real last leg. */
export function getArrowAngle(from: Point, to: Point, variant: ConnectionVariant | string, opts?: PathOptions): number {
  const v = variant as ConnectionVariant;
  // An anchored end knows exactly which side of the shape it meets, so the
  // arrow points straight INTO that side (-normal). This beats every
  // route-derived estimate below and is the only way a bezier arrowhead can
  // be right at all: `bezier`'s fallback here is a flat 0° that was only
  // ever correct for left-to-right edges.
  if (opts?.toNormal) {
    return Math.atan2(-opts.toNormal.y, -opts.toNormal.x) * (180 / Math.PI);
  }
  const hasWaypoints = Boolean(opts?.waypoints && opts.waypoints.length > 0);
  if (!hasWaypoints) {
    switch (v) {
      case "stepped": {
        const midX = (from.x + to.x) / 2;
        return to.x >= midX ? 0 : 180;
      }
      case "straight":
        return Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);
      case "orthogonal": {
        const pts = getRoutePoints(from, to, v, opts);
        const a = pts[pts.length - 2], b = pts[pts.length - 1];
        return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
      }
      default:
        return 0;
    }
  }
  const pts = getRoutePoints(from, to, v, opts);
  const a = pts[pts.length - 2], b = pts[pts.length - 1];
  return Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI);
}

/** Point at fraction `t` (0–1) along a polyline, walked by cumulative
 * segment length rather than by vertex index — so `t` is proportional to
 * actual drawn distance. */
export function pointOnPolyline(points: Point[], t: number): Point {
  if (points.length === 1) return points[0];
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const len = Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
    segLens.push(len);
    total += len;
  }
  if (total === 0) return points[0];
  let target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segLens.length; i++) {
    if (target <= segLens[i] || i === segLens.length - 1) {
      const frac = segLens[i] === 0 ? 0 : target / segLens[i];
      const p0 = points[i], p1 = points[i + 1];
      return { x: p0.x + (p1.x - p0.x) * frac, y: p0.y + (p1.y - p0.y) * frac };
    }
    target -= segLens[i];
  }
  return points[points.length - 1];
}

/** Point at fraction `t` (0–1) along the actual rendered edge path — the
 * true cubic curve for "bezier" (sampled densely so the walk is
 * length-proportional), the exact vertices for the piecewise-linear
 * variants. This is what makes `labelPosition` true to its JSDoc, instead of
 * a straight-line lerp between endpoints that ignores the curve entirely. */
export function getPointAtT(from: Point, to: Point, variant: ConnectionVariant | string, t: number, opts?: PathOptions): Point {
  return pointOnPolyline(getRoutePoints(from, to, variant as ConnectionVariant, opts), t);
}
