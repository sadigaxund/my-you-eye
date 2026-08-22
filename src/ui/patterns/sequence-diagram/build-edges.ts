// Pure data-shaping for SequenceDiagram — turns `items`/`activations` into
// plain records (edges for ConnectionLayer, rects for notes/activation
// bars), no JSX. Split out of SequenceDiagram.tsx purely to keep that file
// under the repo's per-file line guideline (AGENTS.md §2), the same reason
// connection-line/layout.ts is split from geometry.ts.

import type { ReactNode } from "react";
import type { ConnectionLayerEdge } from "../../connection-layer";
import type { Point } from "../../connection-line";
import { GRID } from "../../graph-node/grid";
import { ACTIVATION_W, HEADER_H, ROW_H, LOOP_OUT, laneX, rowCenterY, rowTop, truncateChain } from "./layout";
import type { SequenceItem, SequenceActivation } from "./types";
import { clamp01 } from "../../../lib/math";

const NOTE_MARGIN = GRID;
const NOTE_HALF_W = 2.5 * GRID;

export interface NoteRect {
  id: string;
  left: number;
  top: number;
  width: number;
  opacity: number;
  text: ReactNode;
}

export interface ActivationRect {
  id: string;
  x: number;
  top: number;
  bottom: number;
  accentColor: NonNullable<SequenceActivation["accentColor"]>;
}

/**
 * Builds one `ConnectionLayerEdge` per fully- or partially-revealed message,
 * and one `NoteRect` per fully- or partially-revealed note. Skips any item
 * the reveal front hasn't reached yet entirely (no placeholder is rendered
 * for it). A partial message truncates via `truncateChain` so its drawn
 * path is an exact prefix of the eventual full route.
 */
export function buildMessagesAndNotes(
  items: SequenceItem[],
  laneIndex: Map<string, number>,
  laneWidth: number,
  progress: number,
  activations: SequenceActivation[] = [],
  itemIndex: Map<string, number> = new Map(),
): { edges: ConnectionLayerEdge[]; notes: NoteRect[] } {
  const n = items.length;
  const edges: ConnectionLayerEdge[] = [];
  const notes: NoteRect[] = [];

  // Row spans, per participant, over which an activation bar is drawn. A
  // message touching a participant inside one of these spans must terminate
  // on the BAR's edge; outside them it terminates on the lifeline, which is
  // a zero-width rule so the lane centre is already its border.
  const activeSpans = new Map<string, [number, number][]>();
  for (const a of activations) {
    const start = itemIndex.get(a.start);
    if (start == null) continue;
    const end = a.end != null ? itemIndex.get(a.end) ?? items.length - 1 : items.length - 1;
    const spans = activeSpans.get(a.participant);
    if (spans) spans.push([start, end]);
    else activeSpans.set(a.participant, [[start, end]]);
  }
  /** Half-width of whatever the message actually attaches to at this row. */
  const attachHalfWidth = (participantId: string, row: number): number =>
    (activeSpans.get(participantId) ?? []).some(([s, e]) => row >= s && row <= e) ? ACTIVATION_W / 2 : 0;

  items.forEach((item, i) => {
    const windowStart = i / n;
    const windowEnd = (i + 1) / n;
    const t = windowEnd === windowStart ? 1 : clamp01((progress - windowStart) / (windowEnd - windowStart));
    if (t <= 0) return; // reveal front hasn't reached this item yet

    const fullyRevealed = t >= 1;
    const y = rowCenterY(i);

    if (item.type === "note") {
      const idxs = item.participants.map((id) => laneIndex.get(id)).filter((v): v is number => v != null);
      if (idxs.length === 0) return;
      const xs = idxs.map((idx) => laneX(idx, laneWidth));
      const left = idxs.length === 1 ? xs[0] - NOTE_HALF_W : Math.min(...xs) - NOTE_MARGIN;
      const width = idxs.length === 1 ? NOTE_HALF_W * 2 : Math.max(...xs) - Math.min(...xs) + NOTE_MARGIN * 2;
      // Positioned to START at the row's natural band, but not height-
      // capped: a note whose text wraps past ROW_H grows downward over the
      // row below rather than being truncated mid-sentence — the same
      // "fixed band, content grows past it" tradeoff TreeItem documents for
      // an over-tall CellType value. This is the only thing that can
      // overflow the component's own box (self-loops and spanning notes are
      // both proven to fit inside one lane width), and the root's
      // `overflow-auto` turns that case into a scrollbar rather than a
      // silent spill into whatever is laid out beneath the diagram.
      notes.push({ id: item.id, left, top: y - ROW_H / 2 + GRID / 2, width, opacity: t, text: item.text });
      return;
    }

    const fromIdx = laneIndex.get(item.from);
    const toIdx = laneIndex.get(item.to);
    if (fromIdx == null || toIdx == null) return;

    const isSelf = fromIdx === toIdx;
    // Terminate on the border of whatever is actually drawn at each end
    // rather than on the lane centre. Without this the arrow starts inside
    // the sender's activation bar and its head lands *inside* the
    // receiver's — the "lines slapped on top of the shapes" look. A
    // self-message loops out to the right, so both of its ends sit on the
    // bar's right edge.
    const fromHalf = attachHalfWidth(item.from, i);
    const toHalf = attachHalfWidth(item.to, i);
    const dir = isSelf ? 1 : Math.sign(toIdx - fromIdx);
    const fromX = laneX(fromIdx, laneWidth) + fromHalf * dir;
    const toX = laneX(toIdx, laneWidth) - toHalf * (isSelf ? -1 : dir);
    const from: Point = isSelf ? { x: fromX, y: y - GRID } : { x: fromX, y };
    const to: Point = isSelf ? { x: toX, y: y + GRID } : { x: toX, y };
    const waypoints: Point[] | undefined = isSelf
      ? [{ x: from.x + LOOP_OUT, y: from.y }, { x: to.x + LOOP_OUT, y: to.y }]
      : undefined;

    if (fullyRevealed) {
      edges.push({
        id: item.id, from, to, waypoints,
        variant: "straight", kind: item.kind ?? "sync",
        label: item.label, arrowhead: item.arrowhead ?? true,
      });
    } else {
      const chain = [from, ...(waypoints ?? []), to];
      const { point, prefix } = truncateChain(chain, t);
      edges.push({
        id: item.id, from, to: point,
        waypoints: prefix.length > 0 ? prefix : undefined,
        variant: "straight", kind: item.kind ?? "sync", arrowhead: false,
      });
    }
  });

  return { edges, notes };
}

/**
 * Resolves each `SequenceActivation` to a drawable rect. The bottom edge is
 * clamped to the continuous reveal front (`progress * itemCount` in row
 * units) until the activation's own `end` item is fully revealed, so a bar
 * visibly grows alongside the messages that justify it instead of popping
 * in at full height.
 */
export function buildActivations(
  activations: SequenceActivation[],
  laneIndex: Map<string, number>,
  itemIndex: Map<string, number>,
  laneWidth: number,
  itemCount: number,
  progress: number,
): ActivationRect[] {
  const frontRow = itemCount === 0 ? 0 : progress * itemCount;
  const frontY = HEADER_H + Math.min(frontRow, itemCount) * ROW_H;
  const out: ActivationRect[] = [];
  for (const a of activations) {
    const idx = laneIndex.get(a.participant);
    const startIdx = itemIndex.get(a.start);
    if (idx == null || startIdx == null) continue;
    const endIdx = a.end != null ? itemIndex.get(a.end) : undefined;
    const top = rowCenterY(startIdx);
    const bottomFull = endIdx != null ? rowCenterY(endIdx) : rowTop(itemCount);
    if (frontY <= top) continue; // reveal hasn't reached this activation's start yet
    const bottom = Math.max(top, Math.min(bottomFull, frontY));
    out.push({ id: a.id, x: laneX(idx, laneWidth), top, bottom, accentColor: a.accentColor ?? "primary" });
  }
  return out;
}
