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
  /**
   * Per-step floor, in seconds, on the content-derived duration. Raises
   * `MIN_STEP_SECONDS` for this step only; ignored when `frames` is given
   * (that is the explicit escape hatch) and never lowers the global floor.
   *
   * It exists so one scene kind can be slower than the default without
   * slowing every scene kind down. `MIN_STEP_SECONDS` is 0.6s because a
   * bullet appearing is legible in 0.6s; a code scene spends the same beat
   * panning a camera and cross-fading a diff, and 0.6s of that is a blink
   * rather than a move you can follow. See `codeSteps` in scenes/timing.ts.
   */
  minSeconds?: number;
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
      const floor = Math.max(MIN_STEP_SECONDS, step.minSeconds ?? 0);
      const seconds = Math.max(floor, step.content.length / charsPerSecond);
      frames = Math.round(seconds * fps);
    } else {
      frames = Math.max(
        resolveBeatFrames("normal", fps),
        step.minSeconds != null ? Math.round(step.minSeconds * fps) : 0,
      );
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
