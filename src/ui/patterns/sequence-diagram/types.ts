// Data model shared by SequenceDiagram.tsx (rendering) and build-edges.ts
// (pure data shaping) — split out so neither of those files needs to import
// the other just for a type, and so both stay independently readable.

import type { HTMLAttributes, ReactNode } from "react";
import type { ConnectionKind } from "../../connection-line";

export interface SequenceParticipant {
  id: string;
  label: string;
  /** Small icon shown before the label in the participant's header box. */
  icon?: ReactNode;
}

export interface SequenceMessage {
  id: string;
  /** Participant id the message originates from. */
  from: string;
  /** Participant id the message targets. Equal to `from` renders a
   * self-message — a loop that bulges out from the lane and back in. */
  to: string;
  label?: string;
  /** Maps onto ConnectionLine/ConnectionLayer's existing `kind` union —
   * never a new styling axis of its own. Suggested convention: "sync" for
   * an ordinary synchronous call, "async" for fire-and-forget, "data" for
   * a return/reply, "error" for an exception/error path. Default "sync". */
  kind?: ConnectionKind;
  /** Default true. */
  arrowhead?: boolean;
}

export interface SequenceNote {
  id: string;
  /** One participant id attaches the note to that lane; two or more spans
   * from the leftmost to the rightmost of the named lanes. */
  participants: string[];
  text: ReactNode;
}

export type SequenceItem =
  | ({ type: "message" } & SequenceMessage)
  | ({ type: "note" } & SequenceNote);

export interface SequenceActivation {
  id: string;
  /** Participant id the activation bar is drawn on. */
  participant: string;
  /** Id of the `SequenceItem` (message or note) the bar starts at. */
  start: string;
  /** Id of the `SequenceItem` the bar ends at. Omitted extends the bar to
   * the bottom of the diagram (participant stays "busy" for the rest of
   * the sequence). */
  end?: string;
  accentColor?: "primary" | "success" | "warning" | "danger" | "muted";
}

export interface SequenceDiagramProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  participants: SequenceParticipant[];
  /** Ordered messages and notes — order is both the vertical stacking order
   * and the order `progress` reveals them in. */
  items: SequenceItem[];
  activations?: SequenceActivation[];
  /** Lane (participant column) width in px. Must be a GRID (16) multiple —
   * default 192 (12 × GRID). */
  laneWidth?: number;
  /** 0→1 reveal progress, default 1 (fully drawn). Items reveal strictly in
   * `items` array order: every item before the current reveal position is
   * fully drawn, the one at the reveal front draws partially (a message
   * traces a true prefix of its own route: see `truncateChain`), and every
   * item after it isn't rendered at all yet. A pure function of this prop —
   * no internal timers, no CSS transitions (AGENTS.md §0 rule 6). */
  progress?: number;
}
