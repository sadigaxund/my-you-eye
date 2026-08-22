import { useMemo } from "react";
import { SequenceDiagram } from "../../ui/patterns/sequence-diagram";
import { useSequence, useTimeline } from "../../motion/core";
import type { SequenceRange } from "../../motion/core";
import { sceneSteps, stepName } from "../timing";
import { sequenceItems, deriveActivations } from "./SequenceScene.activations";
import type { SequenceScene as SequenceSceneData } from "../schema";
import { clamp01 } from "../../lib/math";

export interface SequenceSceneProps {
  scene: SequenceSceneData;
}

/** Last message/note whose own step range has started, mirroring
 * CodeScene/TerminalScene's own "current step" convention. */
function currentIndex(ids: string[], ranges: Record<string, SequenceRange>, frame: number): number {
  let index = 0;
  ids.forEach((id, i) => {
    if (frame >= ranges[id].startFrame) index = i;
  });
  return index;
}

/**
 * Wraps `SequenceDiagram`, one message/note per step (TODO.md Phase E).
 * Reveal is entirely `SequenceDiagram`'s own `progress` prop — this scene
 * never re-implements message-by-message reveal, it only computes the right
 * `progress` value to feed it. `SequenceDiagram` reveals items across
 * *uniform* windows (`i/n` to `(i+1)/n` of `progress`, regardless of each
 * item's own authored pace), so `progress` here is deliberately NOT a flat
 * `frame / totalFrames` — it's `(currentIndex + localStepProgress) / n`,
 * which lands `progress` at exactly `(i+1)/n` the moment step `i`'s own
 * range ends. That keeps each message's reveal in sync with its own step's
 * real (content-derived, possibly uneven) duration instead of drifting once
 * two steps have different lengths.
 *
 * Activations are derived, never authored — `scenes.diagram.ts` deliberately
 * gives `SequenceStep` no activation field (`SequenceScene.activations.ts`).
 */
export function SequenceScene({ scene }: SequenceSceneProps) {
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const { frame } = useTimeline();

  const ids = useMemo(() => scene.messages.map((m, i) => stepName(m.id, i)), [scene.messages]);
  const items = useMemo(() => sequenceItems(scene.messages, ids), [scene.messages, ids]);
  const activations = useMemo(() => deriveActivations(scene.messages, ids), [scene.messages, ids]);

  const n = scene.messages.length;
  const index = n > 0 ? currentIndex(ids, ranges, frame) : 0;
  const range = n > 0 ? ranges[ids[index]] : undefined;
  const local = range ? clamp01((frame - range.startFrame) / Math.max(1, range.endFrame - range.startFrame)) : 1;
  const progress = n > 0 ? (index + local) / n : 1;

  return (
    <div className="flex h-full w-full flex-col items-center gap-stack overflow-auto bg-bg p-panel-xl text-fg">
      {scene.title && <h2 className="text-xl font-semibold text-fg">{scene.title}</h2>}
      <SequenceDiagram
        participants={scene.participants}
        items={items}
        activations={activations}
        progress={progress}
        className="mx-auto"
      />
    </div>
  );
}
