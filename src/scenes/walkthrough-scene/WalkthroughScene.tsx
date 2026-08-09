import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { DeviceFrame } from "../../ui/device-frame";
import { Image } from "../../ui/image";
import { Annotation } from "../../ui/annotation";
import { Cursor, Spotlight } from "../../motion";
import type { CursorEvent, CursorAction } from "../../motion";
import { useProgress, useSequence, useTimeline } from "../../motion/core";
import type { SequenceRange } from "../../motion/core";
import { sceneSteps, stepName } from "../timing";
import type { WalkthroughScene as WalkthroughSceneData, WalkthroughStep, PercentPoint, PercentRect } from "../schema";

export interface WalkthroughSceneProps {
  scene: WalkthroughSceneData;
}

const ACTION_MAP: Record<NonNullable<WalkthroughStep["action"]>, CursorAction | undefined> = {
  none: undefined,
  click: "click",
  "double-click": "dblclick",
  drag: "drag",
};

function currentIndex(steps: WalkthroughStep[], ranges: Record<string, SequenceRange>, frame: number): number {
  let index = 0;
  steps.forEach((step, i) => {
    if (frame >= ranges[stepName(step.id, i)].startFrame) index = i;
  });
  return index;
}

/** Measures the device frame's actual content box (`offsetWidth`/
 * `offsetHeight`, never `getBoundingClientRect()` — AGENTS.md §7) so
 * `PercentPoint`/`PercentRect` step data converts to real pixels regardless
 * of how large the scene renders. */
function useFrameSize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      if (width > 0 && height > 0) setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, size };
}

function toPx(p: PercentPoint, size: { width: number; height: number }) {
  return { x: (p.x / 100) * size.width, y: (p.y / 100) * size.height };
}

function rectToPx(r: PercentRect, size: { width: number; height: number }) {
  return { x: (r.x / 100) * size.width, y: (r.y / 100) * size.height, width: (r.width / 100) * size.width, height: (r.height / 100) * size.height };
}

/**
 * `DeviceFrame` + the `Cursor` primitive + `Spotlight` (TODO.md Phase E) —
 * a simulated UI walkthrough over a static screenshot, the alternative to a
 * screen recording. `Cursor` already renders a `Ripple` on click/double-click
 * internally, so this scene never wires `Ripple` up by hand. Percent-of-
 * frame `PercentPoint`/`PercentRect` step coordinates convert to pixels
 * against the *measured* device-frame content box (`useFrameSize`), not a
 * guessed size — the whole reason the schema uses percent instead of raw
 * pixels (steps.ts: "a step keeps pointing at the right thing when
 * `meta.size` changes").
 */
export function WalkthroughScene({ scene }: WalkthroughSceneProps) {
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const { frame } = useTimeline();
  const { ref: frameRef, size } = useFrameSize();

  const hasSteps = scene.steps.length > 0;
  const index = hasSteps ? currentIndex(scene.steps, ranges, frame) : 0;
  const step = hasSteps ? scene.steps[index] : undefined;
  const range = hasSteps ? ranges[stepName(step!.id, index)] : (Object.values(ranges)[0] ?? { startFrame: 0, endFrame: 30 });
  const stepProgress = useProgress({ delay: range.startFrame, duration: Math.max(1, range.endFrame - range.startFrame) });

  const events: CursorEvent[] = useMemo(() => {
    if (size.width === 0) return [];
    const out: CursorEvent[] = [];
    scene.steps.forEach((s, i) => {
      if (!s.to) return;
      const { x, y } = toPx(s.to, size);
      const at = ranges[stepName(s.id, i)].startFrame;
      const action = s.action && s.action !== "none" ? ACTION_MAP[s.action] : undefined;
      out.push({ at, x, y, action });
      if (s.type) out.push({ at: at + 1, x, y, action: "type", text: s.type });
    });
    return out;
  }, [scene.steps, ranges, size]);

  const spotlightRect = step?.spotlight && size.width > 0 ? rectToPx(step.spotlight, size) : undefined;
  const annotateTarget = step?.annotate && step.to && size.width > 0 ? toPx(step.to, size) : undefined;

  const screenshot = <Image src={scene.image} alt={scene.title ?? "screenshot"} fit="cover" radius="none" className="h-full w-full" />;

  return (
    <div className="flex h-full w-full items-center justify-center bg-bg p-panel-xl text-fg">
      <div className="w-full max-w-4xl">
        <DeviceFrame variant={scene.frame ?? "browser"} url={scene.url} title={scene.title} className="aspect-video w-full">
          <div ref={frameRef} className="relative h-full w-full">
            {spotlightRect ? (
              <Spotlight focus={spotlightRect} delay={range.startFrame} duration="normal" className="h-full w-full">
                {screenshot}
              </Spotlight>
            ) : (
              screenshot
            )}
            <Cursor events={events} />
            {annotateTarget && (
              <Annotation target={annotateTarget} label={step!.annotate} progress={stepProgress} containerWidth={size.width} />
            )}
          </div>
        </DeviceFrame>
      </div>
    </div>
  );
}
