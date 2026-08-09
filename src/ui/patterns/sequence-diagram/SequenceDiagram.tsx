import { forwardRef, useMemo } from "react";
import { cn } from "../../../lib/cn";
import { GRID } from "../../graph-node/grid";
import { ConnectionLayer } from "../../connection-layer";
import { Alert } from "../../alert";
import { DEFAULT_LANE_W, HEADER_H, laneX, diagramWidth, diagramHeight } from "./layout";
import { buildMessagesAndNotes, buildActivations } from "./build-edges";
import type { SequenceActivation, SequenceDiagramProps } from "./types";

export type {
  SequenceParticipant, SequenceMessage, SequenceNote, SequenceItem,
  SequenceActivation, SequenceDiagramProps,
} from "./types";

const ACTIVATION_BORDER: Record<NonNullable<SequenceActivation["accentColor"]>, string> = {
  primary: "border-primary",
  success: "border-success",
  warning: "border-warning",
  danger: "border-danger",
  muted: "border-muted",
};

const ACTIVATION_W = GRID * 0.75; // 12px

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * UML-style sequence diagram — participants as vertical lanes with dashed
 * lifelines, messages between them as horizontal (or self-looping) arrows,
 * activation bars, and notes. Data-driven, built entirely from existing
 * primitives: message arrows are `ConnectionLayer` edges (never a hand-drawn
 * `<path>`), notes are `Alert` (`variant="note"`), and every coordinate is a
 * multiple of `GRID` (16) — participant lane centers, message/note row
 * centers, and activation bar bounds alike. The row/edge math itself lives
 * in `./layout.ts` and `./build-edges.ts`; this file is rendering only.
 *
 * Lanes, lifelines and participant header boxes are structural chrome and
 * always render in full regardless of `progress` — only `items` (messages,
 * notes) and `activations` reveal over it, the same "axes stay put, data
 * animates in" split BarChart/LineChart use.
 */
const SequenceDiagram = forwardRef<HTMLDivElement, SequenceDiagramProps>(
  ({ className, participants, items, activations = [], laneWidth = DEFAULT_LANE_W, progress = 1, style, ...props }, ref) => {
    const p = clamp01(progress);
    const width = diagramWidth(participants.length, laneWidth);
    const height = diagramHeight(items.length);

    const laneIndex = useMemo(() => new Map(participants.map((pt, i) => [pt.id, i])), [participants]);
    const itemIndex = useMemo(() => new Map(items.map((it, i) => [it.id, i])), [items]);

    const { edges, notes } = useMemo(
      () => buildMessagesAndNotes(items, laneIndex, laneWidth, p),
      [items, laneIndex, laneWidth, p],
    );
    const activationRects = useMemo(
      () => buildActivations(activations, laneIndex, itemIndex, laneWidth, items.length, p),
      [activations, laneIndex, itemIndex, laneWidth, items.length, p],
    );

    return (
      <div
        ref={ref}
        className={cn("relative overflow-auto", className)}
        style={{ width, height, ...style }}
        {...props}
      >
        {/* Lifelines — vertical dashed rules under each participant header,
            grid-aligned (laneX is always a GRID multiple). */}
        {participants.map((pt, i) => (
          <div
            key={pt.id}
            aria-hidden
            className="absolute border-l border-dashed border-border"
            style={{ left: laneX(i, laneWidth), top: HEADER_H, height: height - HEADER_H }}
          />
        ))}

        {/* Activation bars — grow to track the reveal front until their own
            end item is reached (see buildActivations). */}
        {activationRects.map((r) => (
          <div
            key={r.id}
            aria-hidden
            className={cn("absolute rounded-ui-sm border bg-surface", ACTIVATION_BORDER[r.accentColor])}
            style={{ left: r.x - ACTIVATION_W / 2, top: r.top, width: ACTIVATION_W, height: Math.max(0, r.bottom - r.top) }}
          />
        ))}

        {/* Participant header boxes. */}
        {participants.map((pt, i) => {
          const boxWidth = laneWidth - 2 * GRID;
          return (
            <div
              key={pt.id}
              className="absolute flex items-center justify-center gap-1.5 rounded-ui border border-border bg-surface px-2 shadow-card text-sm font-medium text-fg"
              style={{ left: laneX(i, laneWidth) - boxWidth / 2, top: 0, width: boxWidth, height: HEADER_H }}
            >
              {pt.icon && <span className="shrink-0 flex items-center justify-center [&_svg]:size-icon-sm">{pt.icon}</span>}
              <span className="truncate">{pt.label}</span>
            </div>
          );
        })}

        {notes.map((note) => (
          <Alert
            key={note.id}
            variant="note"
            size="sm"
            className="absolute"
            style={{ left: note.left, top: note.top, width: note.width, opacity: note.opacity }}
          >
            {note.text}
          </Alert>
        ))}

        {/* Messages — reuses ConnectionLayer/ConnectionPath entirely; no
            hand-drawn <path> for a message anywhere in this component.
            bundleParallelEdges is off: its perpendicular offset would push
            message y off the GRID (AGENTS.md §7), and every message here
            already has a distinct row so there's nothing to bundle. */}
        <ConnectionLayer edges={edges} bundleParallelEdges={false} />
      </div>
    );
  },
);
SequenceDiagram.displayName = "SequenceDiagram";

export { SequenceDiagram };
