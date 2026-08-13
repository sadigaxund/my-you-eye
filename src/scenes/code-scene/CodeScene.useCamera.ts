import { useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { measureRelative, keyframesEqual } from "../../motion/camera";
import type { CameraKeyframe } from "../../motion/camera";
import type { SequenceRange } from "../../motion/core";
import { stepName } from "../timing";
import { lineElementId } from "./CodeScene.sources";
import type { CodeScene as CodeSceneData } from "../schema";

export interface CodeCamera {
  containerRef: RefObject<HTMLDivElement | null>;
  keyframes: CameraKeyframe[];
}

/**
 * One `CameraKeyframe` per code step, computed from the actual rendered
 * position of each step's `focus` line range — measured via
 * `offsetTop`/`offsetLeft` (`measureRelative`, from `src/motion/camera`),
 * never `getBoundingClientRect()` (AGENTS.md §7: the latter returns
 * post-transform pixels and would compound with Camera's own zoom). A step
 * with no `focus` gets the full container rect, so the camera settles back
 * to showing the whole file.
 *
 * Reads line positions via `document.getElementById(lineElementId(...))` —
 * the ids `CodeScene` assigns through `CodeBlock`'s `lineId` prop. Re-runs
 * on resize (a `ResizeObserver` on the container) so a font/theme change
 * that reflows line heights recomputes every keyframe rect.
 */
export function useCodeCameraKeyframes(scene: CodeSceneData, ranges: Record<string, SequenceRange>, blockId: string): CodeCamera {
  const containerRef = useRef<HTMLDivElement>(null);
  const [keyframes, setKeyframes] = useState<CameraKeyframe[]>([]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const measure = () => {
      const full = { x: 0, y: 0, width: container.offsetWidth, height: container.offsetHeight };
      const next: CameraKeyframe[] = scene.steps.map((step, i) => {
        const at = ranges[stepName(step.id, i)].startFrame;
        if (!step.focus) return { at, focus: full };
        const [start, end] = step.focus;
        const startEl = document.getElementById(lineElementId(blockId, start));
        const endEl = document.getElementById(lineElementId(blockId, end));
        if (!startEl || !endEl) return { at, focus: full };
        const a = measureRelative(startEl, container);
        const b = measureRelative(endEl, container);
        return { at, focus: { x: 0, y: a.y, width: full.width, height: b.y + b.height - a.y } };
      });
      // Guarded: `ranges` (an effect dependency, below) is a fresh object
      // every CodeScene render (`useSequence` doesn't memoize), so this
      // effect re-runs on every render regardless of whether anything a
      // viewer would see actually changed. An unconditional `setKeyframes`
      // here would commit a new-but-value-equal array every time, forcing
      // another re-render, forcing another re-run of this same effect — an
      // infinite loop that a live rAF-driven preview happens to mask (each
      // tick yields to the browser between renders) but a synchronous
      // frame-capture render (Remotion) does not, tripping React's "Maximum
      // update depth exceeded" the moment it renders a `code` scene. See
      // `measure.ts`'s `keyframesEqual` docblock.
      setKeyframes((prev) => (keyframesEqual(prev, next) ? prev : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
    // sceneSteps(scene) is recomputed on every call, but its identity isn't
    // what matters here — re-measuring keys off the scene/ranges/blockId
    // values that can actually change which lines exist or where they sit.
  }, [scene, ranges, blockId]);

  return { containerRef, keyframes };
}
