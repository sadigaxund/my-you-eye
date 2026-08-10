// Headless step-navigation hook (TODO.md Phase F). The single source of
// truth Presenter's own chrome is built from — nothing in Presenter reaches
// into a driver or a scene's `steps` array directly, it all goes through
// this hook, so a consumer who wants their own UI can use exactly the same
// thing and get identical navigation semantics for free.

import { useCallback, useMemo, useState } from "react";
import { buildSequence } from "../../motion/core";
import type { SequenceRange } from "../../motion/core";
import { sceneSteps, sceneDuration } from "../../scenes";
import type { Scene, Video } from "../../scenes";

/** One (scene, step) pair, flattened across the whole `Video` in playback
 * order — derived from `sceneSteps`/`buildSequence`, the exact spine
 * `VideoRoot` (Phase G) will use for the MP4, so a Presenter's step count
 * and step order can never drift from the video's. */
export interface PresentStep {
  /** Index into the flattened list across the whole video. */
  index: number;
  sceneIndex: number;
  scene: Scene;
  /** Index of this step within its own scene. */
  stepIndex: number;
  /** Matches `stepName()` / the key `sceneSteps`+`buildSequence` use for
   * this step — the same identity every scene component itself looks its
   * own step up by. */
  name: string;
  /** This step's frame range on ITS OWN scene's local timeline (each scene
   * mounts its own driver starting at frame 0 — see Presenter.Stage.tsx). */
  range: SequenceRange;
  /** The on-screen "content" `buildSequence` paced this step from —
   * `step.say` when the author wrote one, otherwise a reasonable fallback
   * (typed code, annotation text, …). Doubles as the SpeakerView script
   * line so there is exactly one place this derivation happens. */
  content?: string;
  isFirstInScene: boolean;
  isLastInScene: boolean;
}

/** One scene's full timing breakdown — what `Presenter.Stage` mounts one of
 * (via `MotionRoot durationInFrames={durationInFrames}`) at a time. */
export interface SceneTiming {
  scene: Scene;
  sceneIndex: number;
  fps: number;
  /** Total local-timeline length of this scene, in frames. */
  durationInFrames: number;
  steps: PresentStep[];
}

export interface UseStepsOptions {
  /** Frames per second driving pacing. Default `video.meta?.fps ?? 30` —
   * matches `VideoRoot`'s own default so a Presenter never paces
   * differently from the MP4 with no explicit fps set on either. */
  fps?: number;
  /** Initial global step index. Default 0. */
  initialIndex?: number;
}

export interface UseStepsResult {
  /** Every step across every scene, flattened, in video order. */
  steps: PresentStep[];
  /** Per-scene timing/step breakdown. */
  scenes: SceneTiming[];
  /** Current global step index, clamped to a valid `steps` index. */
  index: number;
  /** The step at `index` — `undefined` only when `video.scenes` is empty. */
  current: PresentStep | undefined;
  isFirst: boolean;
  isLast: boolean;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  goToScene: (sceneIndex: number) => void;
}

function clampIndex(i: number, length: number): number {
  if (length === 0) return 0;
  return Math.min(Math.max(i, 0), length - 1);
}

export function useSteps(video: Video, options: UseStepsOptions = {}): UseStepsResult {
  const fps = options.fps ?? video.meta?.fps ?? 30;
  const scenesData = video.scenes;

  const { scenes, steps } = useMemo(() => {
    const scenesOut: SceneTiming[] = [];
    const stepsOut: PresentStep[] = [];
    scenesData.forEach((scene, sceneIndex) => {
      const inputs = sceneSteps(scene);
      const ranges = buildSequence(inputs, fps, scene.pace);
      const durationInFrames = sceneDuration(scene, fps);
      const sceneStepsOut: PresentStep[] = inputs.map((input, stepIndex) => ({
        index: -1, // filled in below, once the global position is known
        sceneIndex,
        scene,
        stepIndex,
        name: input.name,
        range: ranges[input.name],
        content: input.content,
        isFirstInScene: stepIndex === 0,
        isLastInScene: stepIndex === inputs.length - 1,
      }));
      for (const s of sceneStepsOut) {
        s.index = stepsOut.length;
        stepsOut.push(s);
      }
      scenesOut.push({ scene, sceneIndex, fps, durationInFrames, steps: sceneStepsOut });
    });
    return { scenes: scenesOut, steps: stepsOut };
  }, [scenesData, fps]);

  const [index, setIndex] = useState(() => clampIndex(options.initialIndex ?? 0, steps.length));
  const safeIndex = clampIndex(index, steps.length);

  const goTo = useCallback((i: number) => setIndex(clampIndex(i, steps.length)), [steps.length]);
  const next = useCallback(() => setIndex((i) => clampIndex(i + 1, steps.length)), [steps.length]);
  const prev = useCallback(() => setIndex((i) => clampIndex(i - 1, steps.length)), [steps.length]);
  const goToScene = useCallback(
    (sceneIndex: number) => {
      const target = scenes[clampIndex(sceneIndex, scenes.length)];
      if (target && target.steps.length > 0) setIndex(target.steps[0].index);
    },
    [scenes],
  );

  return {
    steps,
    scenes,
    index: safeIndex,
    current: steps[safeIndex],
    isFirst: safeIndex === 0,
    isLast: safeIndex === steps.length - 1,
    next,
    prev,
    goTo,
    goToScene,
  };
}
