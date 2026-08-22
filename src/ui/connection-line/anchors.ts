// Anchor geometry — where an edge actually MEETS a shape.
//
// The problem, in the library owner's words: "it feels like you drew the
// components and slapped lines on top of it. It does not feel natural, or at
// least carefully crafted." That is precisely what you get when an edge is
// specified as two centre points: the stroke runs centre-to-centre and is
// then z-ordered above the nodes, so it visibly enters each box, and the
// arrowhead lands somewhere inside the target instead of touching its
// border. Every "nudge the coordinates by a few px until it looks right"
// workaround downstream is a symptom of this module not existing.
//
// Three parts, all here:
//   1. A shape exposes a fixed ANCHOR SET — four side centres plus four
//      corners — instead of a single centre. Endpoints are therefore always
//      ON the border, which is what makes the arrowhead touch.
//   2. When the caller doesn't name an anchor, the pair is CHOSEN. Not by
//      "shortest", which picks corners almost every time and reads as
//      accidental, but by a cost that also rewards leaving and arriving
//      along the side's own outward direction (see `pairCost`).
//   3. Each anchor carries an outward NORMAL, so the route can leave the
//      shape perpendicular to the side it touches rather than shooting off
//      at whatever angle the two endpoints happen to imply. This is what
//      `geometry.ts` feeds into its bezier control points.
//
// Deliberately NOT here: obstacle avoidance and crossing reduction. Those
// are whole-diagram concerns and live in `layout.ts`; this module only ever
// looks at one pair of shapes.

import type { Point } from "./geometry";

/** The eight anchors every rectangular shape exposes. */
export type AnchorName =
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-right"
  | "bottom-left";

/** A shape an edge can attach to. Same coordinate space as `Point`. */
export interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * One end of an edge, given as a shape rather than a bare coordinate. The
 * whole point of the type: the caller supplies the node's box — which it
 * already knows, since it laid the node out — and never has to hand-tune a
 * point on its border.
 */
export interface AnchoredEnd {
  rect: AnchorRect;
  /**
   * Pins this end to one anchor. Omitted or `"auto"` lets `resolveEnds`
   * choose (the default, and the reason this module exists). `"radial"` is
   * the centre-of-gravity variant: the point where the ray toward the other
   * end leaves this rect, which is the right choice for shapes that aren't
   * really rectangles (circles, pills) since it has no corner bias at all.
   */
  anchor?: AnchorName | "auto" | "radial";
  /**
   * Pushes the resolved point this many px OUT along the anchor's normal.
   * Default 0 — the stroke should touch the border, not float near it. Use a
   * small positive value only when the shape has a visible outer ring
   * (focus, selection) the stroke would otherwise collide with.
   */
  inset?: number;
}

/** Either end of an edge: a bare point (as before this module existed) or a shape. */
export type EdgeEnd = Point | AnchoredEnd;

export function isAnchoredEnd(end: EdgeEnd): end is AnchoredEnd {
  return "rect" in end;
}

// Fractional position of each anchor within the rect. Sides first: ties in
// `resolveEnds` break toward whichever candidate was seen first, and a side
// centre is nearly always the tidier read.
const ANCHOR_UNITS: Record<AnchorName, Point> = {
  top: { x: 0.5, y: 0 },
  right: { x: 1, y: 0.5 },
  bottom: { x: 0.5, y: 1 },
  left: { x: 0, y: 0.5 },
  "top-left": { x: 0, y: 0 },
  "top-right": { x: 1, y: 0 },
  "bottom-right": { x: 1, y: 1 },
  "bottom-left": { x: 0, y: 1 },
};

const D = Math.SQRT1_2;

/** Outward unit normal of each anchor — the direction a route should leave along. */
const ANCHOR_NORMALS: Record<AnchorName, Point> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  "top-left": { x: -D, y: -D },
  "top-right": { x: D, y: -D },
  "bottom-right": { x: D, y: D },
  "bottom-left": { x: -D, y: D },
};

export const SIDE_ANCHORS: AnchorName[] = ["top", "right", "bottom", "left"];
export const CORNER_ANCHORS: AnchorName[] = ["top-left", "top-right", "bottom-right", "bottom-left"];
export const ALL_ANCHORS: AnchorName[] = [...SIDE_ANCHORS, ...CORNER_ANCHORS];

export function anchorNormal(name: AnchorName): Point {
  return ANCHOR_NORMALS[name];
}

/** The point on `rect`'s border for `name`, pushed `inset` px outward along its normal. */
export function anchorPoint(rect: AnchorRect, name: AnchorName, inset = 0): Point {
  const u = ANCHOR_UNITS[name];
  const n = ANCHOR_NORMALS[name];
  return {
    x: rect.x + rect.width * u.x + n.x * inset,
    y: rect.y + rect.height * u.y + n.y * inset,
  };
}

export function rectCenter(rect: AnchorRect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

/**
 * Where the ray from `rect`'s centre toward `toward` leaves the rect — the
 * "centre of gravity" attachment. Has no anchor set and therefore no corner
 * bias, so it stays smooth as a node moves (the 8-anchor version necessarily
 * snaps between anchors, which is correct for a static diagram and wrong for
 * something being dragged). Returns the centre itself for a degenerate rect
 * or a target sitting exactly on the centre.
 */
export function radialBorderPoint(rect: AnchorRect, toward: Point, inset = 0): Point {
  const c = rectCenter(rect);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const hw = rect.width / 2;
  const hh = rect.height / 2;
  // Scale the ray until it hits whichever pair of sides it reaches first.
  // Guard each axis so a zero component doesn't produce a NaN scale.
  const sx = dx === 0 ? Infinity : hw / Math.abs(dx);
  const sy = dy === 0 ? Infinity : hh / Math.abs(dy);
  const s = Math.min(sx, sy);
  const len = Math.hypot(dx, dy);
  return {
    x: c.x + dx * s + (dx / len) * inset,
    y: c.y + dy * s + (dy / len) * inset,
  };
}

/**
 * How much worse a candidate is for not leaving/arriving along its own
 * outward normal, as a multiplier on distance. At 0 the selection degrades
 * to "shortest", which is exactly the accidental-looking result this module
 * exists to avoid; much above ~1 and it starts preferring an absurdly long
 * route just to leave a box squarely. 0.6 keeps side-to-side attachment for
 * aligned shapes while still letting a genuine diagonal take the corners.
 */
const DIRECTION_WEIGHT = 0.6;

/**
 * Flat px penalty per corner anchor used. Corners read as deliberate on a
 * true diagonal and as sloppy everywhere else, and the direction term alone
 * doesn't separate the two (a corner's normal is a perfectly good match for
 * a 45° edge AND a decent match for a 20° one). This tips near-ties back to
 * the sides without overriding a real diagonal.
 */
const CORNER_PENALTY = 10;

function pairCost(pa: Point, na: Point, pb: Point, nb: Point, corners: number): number {
  const dx = pb.x - pa.x;
  const dy = pb.y - pa.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return Infinity;
  const ux = dx / dist;
  const uy = dy / dist;
  // +1 when the edge leaves A along A's outward normal, -1 when it would
  // have to double back through the shape it just left. Same for B, against
  // its own normal since the edge arrives rather than departs.
  const da = na.x * ux + na.y * uy;
  const db = nb.x * -ux + nb.y * -uy;
  return dist * (1 + DIRECTION_WEIGHT * (1 - da + (1 - db))) + CORNER_PENALTY * corners;
}

export interface ResolvedEnds {
  from: Point;
  to: Point;
  /** Outward normal at each end, or `undefined` for a bare-point end (nothing to be normal to). */
  fromNormal?: Point;
  toNormal?: Point;
  fromAnchor?: AnchorName;
  toAnchor?: AnchorName;
}

/**
 * Turns a pair of `EdgeEnd`s into concrete endpoints plus their outward
 * normals. Bare points pass through untouched and produce no normals, so
 * every existing call site is byte-identical to before this module existed —
 * the anchoring is strictly opt-in by passing a rect.
 *
 * Mixed pairs work: with a rect on one side and a point on the other, the
 * rect's anchor is chosen against that fixed point. That's the common case
 * for an annotation or a callout pointing at a node.
 */
export function resolveEnds(a: EdgeEnd, b: EdgeEnd): ResolvedEnds {
  const aAnchored = isAnchoredEnd(a);
  const bAnchored = isAnchoredEnd(b);
  if (!aAnchored && !bAnchored) return { from: a, to: b };

  // A `radial` end needs something to aim at before the other end is known,
  // so it aims at the other shape's centre. That's an approximation only
  // when it's paired with an `auto` end (whose chosen border point differs
  // from the centre it was aimed at); for the far more common radial-to-
  // radial and radial-to-point pairs it is exact. `auto` ends need no aim at
  // all — the search below scores real border points directly.
  const aimA = aAnchored ? rectCenter(a.rect) : a;
  const aimB = bAnchored ? rectCenter(b.rect) : b;

  const resolveOne = (end: EdgeEnd, aim: Point): { point: Point; normal?: Point; anchor?: AnchorName } => {
    if (!isAnchoredEnd(end)) return { point: end };
    const inset = end.inset ?? 0;
    if (end.anchor === "radial") {
      const point = radialBorderPoint(end.rect, aim, inset);
      const c = rectCenter(end.rect);
      const len = Math.hypot(point.x - c.x, point.y - c.y);
      // The ray direction IS the outward normal for a radial attachment —
      // without it the bezier would leave horizontally from, say, the top of
      // a circle, which is the exact "slapped on" look this module removes.
      return { point, normal: len === 0 ? undefined : { x: (point.x - c.x) / len, y: (point.y - c.y) / len } };
    }
    if (end.anchor && end.anchor !== "auto") {
      return { point: anchorPoint(end.rect, end.anchor, inset), normal: anchorNormal(end.anchor), anchor: end.anchor };
    }
    return { point: aim, normal: undefined, anchor: undefined };
  };

  const fixedA = resolveOne(a, aimB);
  const fixedB = resolveOne(b, aimA);

  const autoA = aAnchored && (a.anchor === undefined || a.anchor === "auto");
  const autoB = bAnchored && (b.anchor === undefined || b.anchor === "auto");

  if (!autoA && !autoB) {
    return {
      from: fixedA.point, to: fixedB.point,
      fromNormal: fixedA.normal, toNormal: fixedB.normal,
      fromAnchor: fixedA.anchor, toAnchor: fixedB.anchor,
    };
  }

  // Candidate lists: an auto end offers all eight anchors, a settled end
  // offers exactly the one point it already resolved to. Searching the
  // product of the two is at most 8x8 = 64 cheap evaluations per edge, which
  // is nothing next to a single layout pass — no need for a smarter search.
  const candA = autoA
    ? ALL_ANCHORS.map((n) => ({ name: n as AnchorName | undefined, point: anchorPoint((a as AnchoredEnd).rect, n, (a as AnchoredEnd).inset ?? 0), normal: anchorNormal(n) }))
    : [{ name: fixedA.anchor, point: fixedA.point, normal: fixedA.normal ?? { x: 0, y: 0 } }];
  const candB = autoB
    ? ALL_ANCHORS.map((n) => ({ name: n as AnchorName | undefined, point: anchorPoint((b as AnchoredEnd).rect, n, (b as AnchoredEnd).inset ?? 0), normal: anchorNormal(n) }))
    : [{ name: fixedB.anchor, point: fixedB.point, normal: fixedB.normal ?? { x: 0, y: 0 } }];

  // A settled end contributes no direction preference, so its normal is
  // taken as "already ideal" (dot = 1) rather than the zero vector, which
  // would otherwise read as a 90° mismatch and skew the other end's choice.
  const neutral = (normal: Point, hasNormal: boolean, fallback: Point) => (hasNormal ? normal : fallback);

  let best: { cost: number; a: (typeof candA)[number]; b: (typeof candB)[number] } | null = null;
  for (const ca of candA) {
    for (const cb of candB) {
      const dx = cb.point.x - ca.point.x;
      const dy = cb.point.y - ca.point.y;
      const dist = Math.hypot(dx, dy) || 1;
      const u = { x: dx / dist, y: dy / dist };
      const na = neutral(ca.normal, autoA || Boolean(fixedA.normal), u);
      const nb = neutral(cb.normal, autoB || Boolean(fixedB.normal), { x: -u.x, y: -u.y });
      const corners =
        (ca.name && CORNER_ANCHORS.includes(ca.name) ? 1 : 0) + (cb.name && CORNER_ANCHORS.includes(cb.name) ? 1 : 0);
      const cost = pairCost(ca.point, na, cb.point, nb, corners);
      if (!best || cost < best.cost) best = { cost, a: ca, b: cb };
    }
  }

  if (!best) return { from: fixedA.point, to: fixedB.point };
  return {
    from: best.a.point,
    to: best.b.point,
    fromNormal: autoA || fixedA.normal ? best.a.normal : undefined,
    toNormal: autoB || fixedB.normal ? best.b.normal : undefined,
    fromAnchor: best.a.name,
    toAnchor: best.b.name,
  };
}
