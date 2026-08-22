// Pure duration/offset math for the `Video` schema → Remotion frame numbers
// (TODO.md Phase G). No React, no `remotion` import: this is what lets
// `VideoRoot` (which does import `remotion`/`@remotion/transitions`) and
// `PlayerEmbed` (`src/present/player.tsx`, which sizes a `<Player>` before
// it mounts anything) agree on a `Video`'s total length without either one
// depending on the other, and without either one hand-picking a frame count
// — everything here is derived from `sceneDuration` (the same spine the
// Presenter uses) plus one semantic transition-overlap beat.

import { resolveBeatFrames } from "../motion/core";
import { sceneDuration } from "../scenes";
import type { Scene, SceneTransition, Video } from "../scenes";

/**
 * Frames a transition eats out of the boundary between two scenes — the
 * cross-fade/slide/wipe overlap. `"none"` is a hard cut: zero overlap, so a
 * `"none"`-transitioned scene neither steals frames from its neighbour nor
 * pays for a crossfade that isn't there. Every other transition overlaps by
 * one semantic beat (`"normal"`, ~0.5s) rather than a hand-picked frame
 * count, so the overlap scales with `fps` exactly like every other duration
 * in the schema.
 */
export function transitionOverlapFrames(transition: SceneTransition | undefined, fps: number): number {
  if (!transition || transition === "none") return 0;
  return resolveBeatFrames("normal", fps);
}

export interface SceneOffset {
  scene: Scene;
  sceneIndex: number;
  /** This scene's own local duration — its `<TransitionSeries.Sequence>`'s `durationInFrames`. */
  durationInFrames: number;
  /** Absolute frame (on the whole video's own composition timeline) this
   * scene's `<TransitionSeries.Sequence>` starts at, i.e. where the overlap
   * with the previous scene's transition has already been subtracted. This
   * is the same accumulation `<TransitionSeries>` itself performs
   * internally, mirrored here so chrome (chapter markers, the progress bar)
   * can be computed without rendering the tree. */
  startFrame: number;
  /** `startFrame + durationInFrames`. */
  endFrame: number;
}

/**
 * Every scene's absolute position on the whole video's timeline. `VideoRoot`
 * doesn't consume this directly (`<TransitionSeries>` recomputes the same
 * accumulation itself, driven by the same two inputs — `sceneDuration` and
 * `transitionOverlapFrames` — so the two can't disagree); it exists for
 * chrome that needs an absolute frame → scene mapping without walking the
 * render tree (`VideoRoot.Chrome.tsx`'s chapter markers) and for the total
 * duration below.
 */
export function sceneOffsets(video: Video, fps: number): SceneOffset[] {
  const out: SceneOffset[] = [];
  let cursor = 0;
  video.scenes.forEach((scene, sceneIndex) => {
    if (sceneIndex > 0) cursor -= transitionOverlapFrames(scene.transition, fps);
    const durationInFrames = sceneDuration(scene, fps);
    const startFrame = cursor;
    const endFrame = startFrame + durationInFrames;
    out.push({ scene, sceneIndex, durationInFrames, startFrame, endFrame });
    cursor = endFrame;
  });
  return out;
}

const MIN_VIDEO_SECONDS = 1;

/**
 * Total frame length of a `Video`: the sum of every scene's own duration
 * minus every transition's overlap — never a hand-picked number. Floored at
 * one second so an empty `scenes: []` array never produces a zero-duration
 * Remotion composition (which throws).
 */
export function computeVideoDuration(video: Video, fps?: number): number {
  const effectiveFps = fps ?? video.meta?.fps ?? 30;
  const offsets = sceneOffsets(video, effectiveFps);
  const lastEnd = offsets.length > 0 ? offsets[offsets.length - 1].endFrame : 0;
  return Math.max(Math.round(effectiveFps * MIN_VIDEO_SECONDS), lastEnd);
}

export interface VideoChapter {
  sceneIndex: number;
  title: string;
  startFrame: number;
}

/**
 * Chapter markers derived from `title` scenes (TODO.md Phase G "Chrome") —
 * never authored separately, so a chapter list can't drift from the scenes
 * that actually open a section.
 */
export function computeChapters(video: Video, fps?: number): VideoChapter[] {
  const effectiveFps = fps ?? video.meta?.fps ?? 30;
  const chapters: VideoChapter[] = [];
  for (const offset of sceneOffsets(video, effectiveFps)) {
    if (offset.scene.kind === "title") {
      chapters.push({ sceneIndex: offset.sceneIndex, title: offset.scene.title, startFrame: offset.startFrame });
    }
  }
  return chapters;
}
