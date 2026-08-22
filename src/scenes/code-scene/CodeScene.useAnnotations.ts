import { useLayoutEffect, useState } from "react";
import type { RefObject } from "react";
import { measureRelative } from "../../motion/camera";
import type { Point } from "../../ui/connection-line";
import { lineElementId } from "./CodeScene.sources";
import type { CodeAnnotation } from "../schema";

export interface ResolvedCodeAnnotation {
  target: Point;
  text: string;
  side: "left" | "right";
}

export interface CodeAnnotations {
  annotations: ResolvedCodeAnnotation[];
  containerWidth: number;
}

/** Value-equality for two `CodeAnnotations` — guards the `setState` below
 * against committing a new-but-value-equal object every time the effect
 * re-runs (see `CodeScene.useCamera.ts`'s equivalent guard/docblock for why
 * an unconditional `setState` inside a measurement effect can loop). */
function annotationsEqual(a: CodeAnnotations, b: CodeAnnotations): boolean {
  if (a.containerWidth !== b.containerWidth || a.annotations.length !== b.annotations.length) return false;
  return a.annotations.every((x, i) => {
    const y = b.annotations[i];
    return x.target.x === y.target.x && x.target.y === y.target.y && x.text === y.text && x.side === y.side;
  });
}

/**
 * Resolves the current step's `CodeAnnotation[]` into `Annotation`-ready
 * targets — the deferred item TODO.md calls out: `CodeStep.annotate` is
 * schema-valid and validated, but was never wired to a renderer because
 * syncing a leader line with `Camera`'s zoom/pan transform "was more than
 * that batch could do cleanly". The fix is structural, not computational:
 * `CodeScene` mounts the returned `Annotation`s as plain DOM siblings of
 * `CodeBlock`/`CodeDiff` *inside* `Camera`'s own transformed layer (see
 * `CodeScene.tsx`), in the exact same untransformed coordinate space
 * `measureRelative` already produces for `useCodeCameraKeyframes`'s own
 * focus rects — so panning/zooming carries the callout along for free,
 * with no separate transform math here or anywhere else.
 *
 * Target `x` is pinned to the horizontal center of the measured container
 * rather than the annotated line's own (block-level, full-width) div edge
 * — `CodeBlock` renders each line as a block element spanning the whole
 * panel width, so "the line's right edge" is actually the panel's right
 * edge, which would push every right-side callout's label off-screen.
 * Center-anchoring keeps the leader pointing at "this row" while leaving
 * `distance` px of headroom on both sides for the label, regardless of
 * `side`.
 */
export function useCodeAnnotations(
  annotations: CodeAnnotation[] | undefined,
  containerRef: RefObject<HTMLDivElement | null>,
  blockId: string,
): CodeAnnotations {
  const [state, setState] = useState<CodeAnnotations>({ annotations: [], containerWidth: 0 });
  const list = annotations ?? [];
  // Stable dependency key: the annotate array is a fresh array reference on
  // every render (CodeScene builds `step` inline), but its actual content
  // only changes when the step itself changes — measuring keys off that
  // content instead of array identity avoids re-measuring every frame.
  const key = list.map((a) => `${a.line}:${a.side ?? ""}:${a.text}`).join("|");

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || list.length === 0) {
      setState((prev) => (prev.annotations.length === 0 ? prev : { annotations: [], containerWidth: 0 }));
      return undefined;
    }

    const measure = () => {
      const containerWidth = container.offsetWidth;
      const resolved: ResolvedCodeAnnotation[] = [];
      for (const a of list) {
        const el = document.getElementById(lineElementId(blockId, a.line));
        if (!el) continue;
        const rect = measureRelative(el, container);
        resolved.push({
          target: { x: containerWidth / 2, y: rect.y + rect.height / 2 },
          text: a.text,
          side: a.side ?? "right",
        });
      }
      const nextState: CodeAnnotations = { annotations: resolved, containerWidth };
      setState((prev) => (annotationsEqual(prev, nextState) ? prev : nextState));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
    // `key` (not `annotations`/`list`) is the deliberate dependency: CodeScene
    // builds the annotate array inline, so it's a fresh reference every
    // render, but its actual content only changes when the step changes.
  }, [key, blockId, containerRef]);

  return state;
}
