// Diagram + sequence scene data.
//
// These two carry the most authoring risk in the whole schema. The repo
// owner's framing: "cheaper models tend to create nodes, and just wire up
// the lines without any care about how it will look at the end." Three
// schema decisions exist specifically to make that failure impossible
// rather than merely discouraged:
//
//   1. **No pixel coordinates.** `x`/`y` are grid units (× 16px) and both
//      are optional — omit them and `layered()`/`grid()` place the node,
//      with crossing reduction already applied.
//   2. **Groups have no geometry at all.** A group's box is computed from
//      the bounds of its member nodes, so a boundary region can never be
//      drawn in the wrong place or leave a node hanging outside it.
//   3. **Activation bars are derived, not authored.** A participant is busy
//      from the message that reaches it until the one it sends back.
//
// What is left for the author is what they actually know: which things
// exist, what talks to what, and in which order it happens.

import type { SceneBase, StepBase, AccentColor, StatusKind, DiagramAnnotation } from "./steps";

/** Picks node shape, default edge routing and default layout in one word. */
export type DiagramPreset =
  /** Boxed services, orthogonal edges, left-to-right ranks. */
  | "architecture"
  /** Same ranks, but edges default to `kind: "data"` and carry flow tokens. */
  | "dataflow"
  /** Pill nodes, curved edges, grid placement — for state machines. */
  | "state"
  /** Top-to-bottom ranks, stepped edges — for decision flows. */
  | "flowchart";

/** Automatic placement for nodes without explicit coordinates. Defaults to
 * the preset's own choice; set it only to override that. */
export type DiagramLayout = "layered-horizontal" | "layered-vertical" | "grid";

export interface DiagramNode {
  id: string;
  label: string;
  /** Muted second line, e.g. a technology or an instance count. */
  sublabel?: string;
  /** Semantic accent, not a color. Default: none. */
  accent?: AccentColor;
  /** Id of the `DiagramGroup` this node belongs to. */
  group?: string;
  /** Status pip in the node header. */
  status?: StatusKind;
  /** Metric shown in the node footer, e.g. "1.2k req/s". */
  metric?: string;
  /** Explicit column position in **grid units** (× 16px), not pixels.
   * Overrides the computed layout on this axis only — you can pin `x` and
   * still let `y` be computed. */
  x?: number;
  /** Explicit row position in grid units. See `x`. */
  y?: number;
}

export interface DiagramEdge {
  /** Explicit id. When omitted the edge's id is `"<from>-><to>"`, and that
   * derived form is what `DiagramStep.connect`/`flow` reference — so an id
   * is only worth setting when two edges share the same node pair. */
  id?: string;
  from: string;
  to: string;
  label?: string;
  /** Semantic edge styling: a call, a fire-and-forget, a return payload, an
   * error path. Default "sync" (or "data" under the `dataflow` preset). */
  kind?: "sync" | "async" | "data" | "error";
  /** Route shape. Defaults to the preset's choice — override only when a
   * specific edge reads badly. */
  route?: "orthogonal" | "bezier" | "stepped" | "straight";
}

/** A labelled boundary region — a VPC, a cluster, a service boundary. Its
 * rectangle is computed from the member nodes; there is deliberately no way
 * to position or size it by hand. */
export interface DiagramGroup {
  id: string;
  label: string;
  border?: "dashed" | "solid";
}

export interface DiagramStep extends StepBase {
  /** Node and group ids that appear on this step. Anything never named in
   * any step's `reveal` is present from the first frame. */
  reveal?: string[];
  /** Edge ids whose line draws on this step. */
  connect?: string[];
  /** Edge ids that carry animated flow tokens for this step's duration —
   * the "watch the request travel" beat. */
  flow?: string[];
  /** Node ids to spotlight; everything else dims. */
  focus?: string[];
  /** Leader-line callouts pinned to nodes. */
  annotate?: DiagramAnnotation[];
}

export interface DiagramScene extends SceneBase {
  kind: "diagram";
  /** Default "architecture". */
  preset?: DiagramPreset;
  title?: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: DiagramGroup[];
  /** Overrides the preset's default placement strategy. */
  layout?: DiagramLayout;
  steps: DiagramStep[];
}

export interface SequenceParticipantSpec {
  id: string;
  label: string;
}

/** One message, revealed as its own step. */
export interface SequenceMessageStep extends StepBase {
  type: "message";
  /** Participant id the message leaves from. */
  from: string;
  /** Participant id it arrives at. Equal to `from` draws a self-call loop. */
  to: string;
  label?: string;
  /** Default "sync". Use "data" for a return/reply and "error" for a
   * failure path — that is what makes the diagram readable at a glance. */
  kind?: "sync" | "async" | "data" | "error";
}

/** A note attached to one lane, or spanning several. */
export interface SequenceNoteStep extends StepBase {
  type: "note";
  text: string;
  /** Participant ids the note attaches to. One anchors it to that lane;
   * two or more span from the leftmost to the rightmost. */
  on: string[];
}

export type SequenceStep = SequenceMessageStep | SequenceNoteStep;

export interface SequenceScene extends SceneBase {
  kind: "sequence";
  title?: string;
  participants: SequenceParticipantSpec[];
  /** Ordered messages and notes. Order is both the vertical stacking order
   * and the reveal order. Activation bars are derived from it. */
  messages: SequenceStep[];
}
