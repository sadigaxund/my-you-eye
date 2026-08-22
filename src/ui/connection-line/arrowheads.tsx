import type { ReactNode } from "react";

// Edge terminators, and — just as importantly — how far the route has to
// stop short of the endpoint for each one.
//
// The owner's report: "the tip of the line fix worked, but the line itself
// should've stopped at the start of the tip. Not like tip slapped on the
// line. Because it causes the line underneath protrudes and kinda messes
// with the tip of the pointer."
//
// That is a real geometric conflict, not a z-order accident. A solid
// triangle tapers to nothing at its tip, so near the point its half-height
// falls below the stroke's half-width (0.5px vs 1px one pixel back from a
// 8x8 head with a 2px stroke) and the stroke squeezes out on both sides of
// the shape it is supposed to be inside. Drawing the marker later doesn't
// help — the stroke is genuinely wider than the marker there.
//
// So every shape declares `lineInset`: the distance from the endpoint at
// which the route must END. A SOLID head absorbs the line, so its inset is
// its own length minus ~1px of deliberate overlap (a seam between a stroke
// and a fill that merely touch will show a hairline gap under antialiasing).
// An OPEN head is drawn around the line and needs it to reach the tip, so
// its inset is 0. Getting this per-shape is the whole reason this table
// exists rather than one hardcoded number.

export type ArrowheadShape =
  | "triangle"
  | "open"
  | "circle"
  | "hollow-circle"
  | "diamond"
  | "hollow-diamond"
  | "bar"
  | "crow";

export interface ArrowheadDef {
  /** px the route must stop short of its endpoint so the stroke never
   * protrudes through (or past) the marker. */
  lineInset: number;
  /** Marker geometry in "arrow space": tip at the ORIGIN, body along -x.
   * The consumer applies `translate(to) rotate(angle)`, so every shape here
   * is authored pointing along +x. */
  render: () => ReactNode;
}

// One scale for the whole set so heads stay visually consistent when
// swapped, and so `lineInset` values are comparable at a glance.
const LEN = 8;
const HALF = 4;
const STROKE = 2;

export const ARROWHEADS: Record<ArrowheadShape, ArrowheadDef> = {
  /** Solid triangle — the default directed edge. */
  triangle: {
    lineInset: LEN - 1,
    render: () => <polygon points={`${-LEN},${-HALF} 0,0 ${-LEN},${HALF}`} fill="currentColor" />,
  },

  /** Stroked V. Lighter than a solid head, and conventional for an
   * asynchronous/non-blocking message in UML. The line runs all the way to
   * the vertex and completes the shape, so nothing is trimmed. */
  open: {
    lineInset: 0,
    render: () => (
      <path
        d={`M ${-LEN - 1},${-HALF - 1} L 0,0 L ${-LEN - 1},${HALF + 1}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },

  /** Filled dot. A terminator rather than a direction — "attaches here". */
  circle: {
    lineInset: LEN - 1,
    render: () => <circle cx={-LEN / 2} cy={0} r={LEN / 2} fill="currentColor" />,
  },

  /** Hollow dot. Unlike the solid heads this CANNOT overlap the line: the
   * stroke would be visible through the middle, so the inset is the full
   * diameter with no overlap allowance. */
  "hollow-circle": {
    lineInset: LEN,
    render: () => (
      <circle cx={-LEN / 2} cy={0} r={LEN / 2 - STROKE / 2} fill="var(--color-canvas-surface)" stroke="currentColor" strokeWidth={STROKE} />
    ),
  },

  /** Filled diamond — UML composition. */
  diamond: {
    lineInset: LEN * 1.5 - 1,
    render: () => <polygon points={`0,0 ${-LEN * 0.75},${-HALF} ${-LEN * 1.5},0 ${-LEN * 0.75},${HALF}`} fill="currentColor" />,
  },

  /** Hollow diamond — UML aggregation. Opaque fill, not `none`: the route
   * stops at its back vertex, and a transparent centre would show whatever
   * the edge passes over. */
  "hollow-diamond": {
    lineInset: LEN * 1.5,
    render: () => (
      <polygon
        points={`0,0 ${-LEN * 0.75},${-HALF} ${-LEN * 1.5},0 ${-LEN * 0.75},${HALF}`}
        fill="var(--color-canvas-surface)"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
    ),
  },

  /** Perpendicular tick. ER-diagram "exactly one"; also a plain stop. The
   * line meets it head-on, so nothing is trimmed. */
  bar: {
    lineInset: 0,
    render: () => <line x1={0} y1={-HALF - 1} x2={0} y2={HALF + 1} stroke="currentColor" strokeWidth={STROKE} strokeLinecap="round" />,
  },

  /** Crow's foot — ER-diagram "many". The centre prong continues the line, so
   * the route runs to the tip and three prongs fan back from it. The outer
   * prongs spread noticeably wider than `open`'s: at an 8px head the two are
   * otherwise indistinguishable, since the centre prong just overlaps the
   * incoming stroke and what's left reads as a plain V. */
  crow: {
    lineInset: 0,
    render: () => (
      <path
        d={`M ${-LEN - 1},${-HALF * 1.9} L 0,0 L ${-LEN - 1},${HALF * 1.9} M ${-LEN - 1},0 L 0,0`}
        fill="none"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
};

export const ARROWHEAD_SHAPES = Object.keys(ARROWHEADS) as ArrowheadShape[];

/** `true` keeps the historical default; a name selects a shape. */
export type ArrowheadProp = boolean | ArrowheadShape;

export function resolveArrowhead(prop: ArrowheadProp | undefined): ArrowheadDef | null {
  if (!prop) return null;
  return ARROWHEADS[prop === true ? "triangle" : prop] ?? ARROWHEADS.triangle;
}
