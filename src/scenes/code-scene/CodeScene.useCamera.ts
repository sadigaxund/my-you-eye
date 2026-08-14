import { useLayoutEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { measureRelative, keyframesEqual, fitZoom } from "../../motion/camera";
import type { CameraKeyframe, CameraRect } from "../../motion/camera";
import type { SequenceRange } from "../../motion/core";
import { stepName } from "../timing";
import { lineElementId } from "./CodeScene.sources";
import type { CodeScene as CodeSceneData } from "../schema";

/** Ceiling on a `focus` step's zoom — see `zoomFor`. */
const MAX_ZOOM = 1.6;

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

      /** Union of a set of measured line rects. The rect's WIDTH has to come
       * from the lines themselves, not from the container: framing every step
       * at `width: full.width` pinned the camera's horizontal scale to 1, so
       * `zoom = min(fullW/rectW, fullH/rectH)` could never exceed 1 and the
       * camera never actually zoomed — it only ever panned, which is why a
       * "focus lines 2–5" step looked identical to the wide shot before it. */
      const union = (els: HTMLElement[]) => {
        if (els.length === 0) return full;
        const rects = els.map((el) => measureRelative(el, container));
        const x = Math.min(...rects.map((r) => r.x));
        const y = Math.min(...rects.map((r) => r.y));
        const right = Math.max(...rects.map((r) => r.x + r.width));
        const bottom = Math.max(...rects.map((r) => r.y + r.height));
        return { x, y, width: right - x, height: bottom - y };
      };

      // Every line currently mounted — the frame a step with no `focus`
      // settles to. The whole container would leave the panel adrift in an
      // otherwise empty 16:9 frame now that it sizes to its content.
      const allLines = () =>
        Array.from(container.querySelectorAll<HTMLElement>(`[id^="${blockId}-L"]`));

      // Camera's own `fit` would scale a four-line focus rect until it filled
      // the frame — around 2.4× here, which crops the surrounding lines away
      // and turns readable code into a wall of letterforms. Capping it keeps
      // the move legible as "lean in on these lines", not "replace the shot".
      const zoomFor = (rect: CameraRect) => Math.min(fitZoom(rect, full.width, full.height), MAX_ZOOM);

      const frameFor = (at: number, els: HTMLElement[]): CameraKeyframe => {
        const focus = union(els);
        return { at, focus, zoom: zoomFor(focus) };
      };

      const next: CameraKeyframe[] = scene.steps.map((step, i) => {
        const at = ranges[stepName(step.id, i)].startFrame;
        if (!step.focus) return frameFor(at, allLines());
        const [start, end] = step.focus;
        const startEl = document.getElementById(lineElementId(blockId, start));
        const endEl = document.getElementById(lineElementId(blockId, end));
        if (!startEl || !endEl) return frameFor(at, allLines());
        return frameFor(at, [startEl, endEl]);
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
