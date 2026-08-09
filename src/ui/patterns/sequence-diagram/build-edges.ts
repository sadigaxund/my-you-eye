// Pure data-shaping for SequenceDiagram — turns `items`/`activations` into
// plain records (edges for ConnectionLayer, rects for notes/activation
// bars), no JSX. Split out of SequenceDiagram.tsx purely to keep that file
// under the repo's per-file line guideline (AGENTS.md §2), the same reason
// connection-line/layout.ts is split from geometry.ts.

import type { ReactNode } from "react";
import type { ConnectionLayerEdge } from "../../connection-layer";
import type { Point } from "../../connection-line";
import { GRID } from "../../graph-node/grid";
import { HEADER_H, ROW_H, LOOP_OUT, laneX, rowCenterY, rowTop, truncateChain } from "./layout";
import type { SequenceItem, SequenceActivation } from "./types";

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

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
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
): { edges: ConnectionLayerEdge[]; notes: NoteRect[] } {
  const n = items.length;
  const edges: ConnectionLayerEdge[] = [];
  const notes: NoteRect[] = [];

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
      // capped: a note whose text wraps past ROW_H overflows visibly
      // (overlapping the row below) rather than being clipped — the same
      // "fixed band, content overflows past it" tradeoff TreeItem documents
      // for an over-tall CellType value.
      notes.push({ id: item.id, left, top: y - ROW_H / 2 + GRID / 2, width, opacity: t, text: item.text });
      return;
    }

    const fromIdx = laneIndex.get(item.from);
    const toIdx = laneIndex.get(item.to);
    if (fromIdx == null || toIdx == null) return;

    const isSelf = fromIdx === toIdx;
    const from: Point = isSelf ? { x: laneX(fromIdx, laneWidth), y: y - GRID } : { x: laneX(fromIdx, laneWidth), y };
    const to: Point = isSelf ? { x: laneX(toIdx, laneWidth), y: y + GRID } : { x: laneX(toIdx, laneWidth), y };
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
