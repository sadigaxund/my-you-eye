import { useTimeline } from "./TimelineContext";
import { resolveBeatFrames } from "./beats";
import type { Beat } from "./types";

/** Coarse scene-level pacing escape hatch (TODO.md D5). */
export type Pace = "slow" | "normal" | "fast";

export interface SequenceStepInput {
  /** Unique key — becomes the property name in the returned map. */
  name: string;
  /** Explicit duration in frames. The escape hatch: skips content-derived timing entirely. */
  frames?: number;
  /** Text content whose length estimates a natural reveal/typing/reading duration. */
  content?: string;
  /** Extra hold time appended after the computed duration, so a step can pause before the next one starts. */
  hold?: Beat;
}

export interface SequenceRange {
  startFrame: number;
  endFrame: number;
}

const PACE_CHARS_PER_SECOND: Record<Pace, number> = {
  slow: 14,
  normal: 22,
  fast: 32,
};
const MIN_STEP_SECONDS = 0.6;

/**
 * Pure timeline-building logic — no hooks, no React. This is the shared
 * spine TODO.md D1/D5 describe: the same step list, run through this same
 * function, drives both an MP4 (`VideoRoot`/`useSequence` inside a Remotion
 * composition) and a click-through Presenter (`useSteps`), so pacing never
 * drifts between the two. Exported directly so it's unit-testable without
 * rendering React at all.
 */
export function buildSequence(
  steps: SequenceStepInput[],
  fps: number,
  pace: Pace = "normal",
): Record<string, SequenceRange> {
  const out: Record<string, SequenceRange> = {};
  let cursor = 0;
  const charsPerSecond = PACE_CHARS_PER_SECOND[pace];

  for (const step of steps) {
    let frames: number;
    if (step.frames != null) {
      frames = Math.max(1, Math.round(step.frames));
    } else if (step.content != null) {
      const seconds = Math.max(MIN_STEP_SECONDS, step.content.length / charsPerSecond);
      frames = Math.round(seconds * fps);
    } else {
      frames = resolveBeatFrames("normal", fps);
    }
    if (step.hold != null) frames += resolveBeatFrames(step.hold, fps);

    const startFrame = cursor;
    const endFrame = startFrame + frames;
    out[step.name] = { startFrame, endFrame };
    cursor = endFrame;
  }

  return out;
}

/** Declarative timeline builder — reads `fps` from the active driver via useTimeline(). */
export function useSequence(steps: SequenceStepInput[], pace: Pace = "normal"): Record<string, SequenceRange> {
  const { fps } = useTimeline();
  return buildSequence(steps, fps, pace);
}
