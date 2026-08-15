// Per-frame step-state derivation for DiagramScene — pure functions over
// `scene`/`ranges`/`frame`, no React. Mirrors the "which step is current"
// convention CodeScene/TerminalScene already established
// (`currentStepIndex`: the last step whose own range has started), and
// extends it with the id-level lookups a diagram needs: which step (if any)
// reveals a given node/group, and which step (if any) draws a given edge.

import { applyEasing } from "../../motion/core";
import type { SequenceRange } from "../../motion/core";
import { stepName } from "../timing";
import type { DiagramScene as DiagramSceneData, DiagramStep } from "../schema";
import { clamp01 } from "../../lib/math";

export function currentDiagramStepIndex(scene: DiagramSceneData, ranges: Record<string, SequenceRange>, frame: number): number {
  let index = 0;
  scene.steps.forEach((step, i) => {
    if (frame >= ranges[stepName(step.id, i)].startFrame) index = i;
  });
  return index;
}

/**
 * The range of the first step whose `reveal` lists `id`, or `undefined` if
 * no step ever does — meaning (per `scenes.diagram.ts`'s own doc comment)
 * `id` is present from the first frame, not staged at all.
 */
export function findRevealRange(id: string, scene: DiagramSceneData, ranges: Record<string, SequenceRange>): SequenceRange | undefined {
  for (let i = 0; i < scene.steps.length; i++) {
    if (scene.steps[i].reveal?.includes(id)) return ranges[stepName(scene.steps[i].id, i)];
  }
  return undefined;
}

/**
 * The range of the first step whose `connect` lists `edgeId`, or `undefined`
 * if no step ever does. Edges never mentioned in any step's `connect` follow
 * the same "present from frame 0" default `reveal` documents for nodes —
 * the schema doesn't repeat that rule for edges, but requiring every single
 * edge to be individually staged just to appear at all would be a much
 * worse authoring default than reusing the one `reveal` already establishes.
 */
export function findConnectRange(edgeId: string, scene: DiagramSceneData, ranges: Record<string, SequenceRange>): SequenceRange | undefined {
  for (let i = 0; i < scene.steps.length; i++) {
    if (scene.steps[i].connect?.includes(edgeId)) return ranges[stepName(scene.steps[i].id, i)];
  }
  return undefined;
}

/** 0→1 draw progress for an edge at `frame`, given the range of the step
 * that draws it (`undefined` = always fully drawn). Plain eased
 * interpolation (`applyEasing`, reused from `motion/core` rather than
 * hand-rolled) over the step's own start/end frames — an edge draws over
 * exactly the step that names it in `connect`, not a fixed beat, since
 * "drawing the edge on" IS that step's content. */
export function connectProgress(range: SequenceRange | undefined, frame: number): number {
  if (!range) return 1;
  const span = range.endFrame - range.startFrame;
  if (span <= 0) return 1;
  const t = clamp01((frame - range.startFrame) / span);
  return applyEasing(t, "standard");
}

/** Node/group ids to spotlight for the current step, or `null` when the
 * current step doesn't set `focus` (nothing dims). */
export function currentFocusIds(step: DiagramStep | undefined): Set<string> | null {
  if (!step?.focus || step.focus.length === 0) return null;
  return new Set(step.focus);
}

/**
 * Node ids to keep at full opacity when a node is "expanded" via the
 * live-only click interaction (TODO.md Phase F / D2): the expanded node
 * itself plus every node directly connected to it by an edge. `null` when
 * nothing is expanded — the default, and always true with no
 * `LiveInteractionContext` provider mounted (`src/scenes/interaction.ts`),
 * so this never changes a video render's or a plain static render's output.
 */
export function expandedFocusIds(expandedId: string | null, edges: DiagramSceneData["edges"]): Set<string> | null {
  if (!expandedId) return null;
  const set = new Set<string>([expandedId]);
  for (const e of edges) {
    if (e.from === expandedId) set.add(e.to);
    if (e.to === expandedId) set.add(e.from);
  }
  return set;
}
