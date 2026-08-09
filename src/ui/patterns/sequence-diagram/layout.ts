// Pure grid math for SequenceDiagram — no React, no DOM. Mirrors the split
// pattern of graph-node/grid.ts and connection-line/geometry.ts: layout
// stays deterministic (and independently reasoned about) separately from
// the component that renders it. Nothing here duplicates ConnectionLayer's
// own path math — `truncateChain` below solves a different problem (finding
// how much of an already-known point chain to keep for a partial reveal),
// not how to draw the path itself.

import { GRID } from "../../graph-node/grid";
import type { Point } from "../../connection-line";

/** Default lane (participant column) width — a whole number of grid cells,
 * roomy enough for a participant box + its dashed lifeline without lanes
 * feeling cramped. Callers can override via `laneWidth`; keep it a GRID
 * multiple — off-grid values misalign message y AND participant x against
 * every other canvas-space component in the repo (AGENTS.md §7). */
export const DEFAULT_LANE_W = 12 * GRID; // 192

/** Participant header box height — fixed, never content-driven. Same
 * "height is a function of row count, not content" rule AGENTS.md §7
 * states for GraphNode, applied here to a fixed row count of one. */
export const HEADER_H = 3 * GRID; // 48

/** Height of one message/note row. Fixed regardless of what's drawn in it —
 * a note whose text wraps past this height overflows visibly rather than
 * perturbing every row below it, the same accepted tradeoff TreeItem takes
 * for an over-tall CellType value (see TreeItem.tsx's own "min-h-0" comment). */
export const ROW_H = 4 * GRID; // 64

/** How far a self-message's loop bulges out from its own lane before
 * doubling back down the same lane. */
export const LOOP_OUT = 3 * GRID; // 48

export function laneX(index: number, laneWidth: number = DEFAULT_LANE_W): number {
  return index * laneWidth + laneWidth / 2;
}

/** Vertical center of item row `i` (0-indexed) — where a message's line, or
 * a note's box, is centered. Always a GRID multiple: HEADER_H and ROW_H are
 * both GRID multiples and ROW_H is an even number of cells, so half a row
 * is itself a whole cell (identical reasoning to GraphNode's `portY`). */
export function rowCenterY(i: number): number {
  return HEADER_H + i * ROW_H + ROW_H / 2;
}

/** Top edge of item row `i` — the bottom edge of the diagram's content is
 * `rowTop(itemCount)`. */
export function rowTop(i: number): number {
  return HEADER_H + i * ROW_H;
}

export function diagramWidth(participantCount: number, laneWidth: number = DEFAULT_LANE_W): number {
  return Math.max(1, participantCount) * laneWidth;
}

export function diagramHeight(itemCount: number): number {
  return HEADER_H + Math.max(1, itemCount) * ROW_H + GRID;
}

/**
 * Walks a straight-line point chain (`[from, ...waypoints, to]` — exactly
 * what the `"straight"` ConnectionLine variant draws, no curve smoothing to
 * account for) and returns the point at arc-length fraction `t`, plus the
 * subset of `waypoints` that lie fully before it.
 *
 * This is what lets a partially-revealed message trace its EXACT eventual
 * route — corner and all, for a self-message's loop — instead of a straight
 * beeline toward wherever the reveal front currently is: feed the returned
 * `point` back in as the edge's `to` and `prefix` as its `waypoints`, and
 * the drawn path is a true prefix of the full route, because it shares the
 * same vertices up to the cut.
 */
export function truncateChain(chain: Point[], t: number): { point: Point; prefix: Point[] } {
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < chain.length - 1; i++) {
    const len = Math.hypot(chain[i + 1].x - chain[i].x, chain[i + 1].y - chain[i].y);
    segLens.push(len);
    total += len;
  }
  if (total === 0) return { point: chain[0], prefix: [] };
  let target = Math.max(0, Math.min(1, t)) * total;
  for (let i = 0; i < segLens.length; i++) {
    if (target <= segLens[i] || i === segLens.length - 1) {
      const frac = segLens[i] === 0 ? 0 : target / segLens[i];
      const a = chain[i], b = chain[i + 1];
      return {
        point: { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac },
        prefix: chain.slice(1, i + 1),
      };
    }
    target -= segLens[i];
  }
  return { point: chain[chain.length - 1], prefix: chain.slice(1, -1) };
}
