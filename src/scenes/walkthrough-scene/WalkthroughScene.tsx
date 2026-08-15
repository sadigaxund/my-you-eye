import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { DeviceFrame } from "../../ui/device-frame";
import { Image } from "../../ui/image";
import { Cursor, Spotlight } from "../../motion";
import type { CursorEvent, CursorAction } from "../../motion";
import { useProgress, useSequence, useTimeline } from "../../motion/core";
import type { SequenceRange } from "../../motion/core";
import { sceneSteps, stepName } from "../timing";
import { spotlightPlan } from "./WalkthroughScene.spotlight";
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
 * The one place a step's target point is derived (TODO.md D1: one
 * computation, not two independently-authored ones that can drift). When a
 * step sets `spotlight`, that rect's own center IS the target — the cursor
 * moves there and an `annotate` label anchors there, so the cursor always
 * ends up inside the highlighted region by construction, never a hand-typed
 * `to` that happens to land close to (but not exactly at) the spotlight's
 * center (owner report: "the cursor does not end up at the highlighted
 * circle area"). `to` is still the target for steps with no spotlight.
 */
function resolveTarget(step: WalkthroughStep): PercentPoint | undefined {
  if (step.spotlight) {
    return { x: step.spotlight.x + step.spotlight.width / 2, y: step.spotlight.y + step.spotlight.height / 2 };
  }
  return step.to;
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
      const target = resolveTarget(s);
      if (!target) return;
      const { x, y } = toPx(target, size);
      const at = ranges[stepName(s.id, i)].startFrame;
      const action = s.action && s.action !== "none" ? ACTION_MAP[s.action] : undefined;
      out.push({ at, x, y, action });
      if (s.type) out.push({ at: at + 1, x, y, action: "type", text: s.type });
    });
    return out;
  }, [scene.steps, ranges, size]);

  // Spotlight stays mounted on every frame — including steps with no
  // `spotlight` rect (`dim: 0`, an inert overlay) — rather than being
  // conditionally swapped in/out around `screenshot`. Toggling which
  // element wraps `screenshot` unmounts and remounts the Image itself at
  // the exact frame a step with a spotlight starts/ends, which is what was
  // causing the reported twitch: React tears down and rebuilds the image's
  // DOM node (and this component's `useFrameSize` ResizeObserver briefly
  // re-measures a freshly-mounted node), producing a one-frame layout
  // hiccup right at that step boundary. A stable wrapper means `screenshot`
  // never remounts, no matter how many steps toggle their spotlight on and
  // off.
  //
  // The rect, the dim and the fade-in anchor all come from
  // `spotlightPlan` (WalkthroughScene.spotlight.ts) rather than from
  // `step.spotlight` directly: read raw, both the rect and the dim are step
  // functions that change discontinuously at the frame the index advances,
  // which is the one-frame "pop" from fully dimmed to clear. The plan makes
  // them continuous across the boundary. `Spotlight` stays a pure function
  // of the values it is handed.
  const plan = spotlightPlan(scene.steps, ranges, index, frame);
  const spotlightFocus = plan.focus && size.width > 0 ? rectToPx(plan.focus, size) : { x: 0, y: 0, width: 0, height: 0 };

  const target = step ? resolveTarget(step) : undefined;
  const annotateTarget = step?.annotate && target && size.width > 0 ? toPx(target, size) : undefined;

  const screenshot = <Image src={scene.image} alt={scene.title ?? "screenshot"} fit="cover" radius="none" className="h-full w-full" />;

  return (
    <div className="flex h-full w-full items-center justify-center bg-bg p-panel-xl text-fg">
      <div className="w-full max-w-4xl">
        <DeviceFrame variant={scene.frame ?? "browser"} url={scene.url} title={scene.title} className="aspect-video w-full">
          <div ref={frameRef} className="relative h-full w-full">
            <Spotlight focus={spotlightFocus} dim={plan.dim} delay={plan.delay} duration="normal" className="h-full w-full">
              {screenshot}
            </Spotlight>
            <Cursor events={events} />
            {/* A label only, never a second leader line pointing at the same
                spot the Cursor is already at (owner report: "no need to add
                another pointing line if there is a cursor, kinda
                duplication") — `Annotation`'s leader-line is always drawn
                (no "line-less" mode to opt into), so this renders a plain
                floating callout instead of importing that component. */}
            {annotateTarget && (
              <div
                className="pointer-events-none absolute rounded-ui-sm bg-surface-opaque px-tight py-compact-y text-xs text-fg shadow-card"
                style={{
                  left: annotateTarget.x,
                  top: annotateTarget.y,
                  opacity: stepProgress,
                  transform: "translate(-50%, calc(-100% - var(--spacing-tight)))",
                }}
              >
                {step!.annotate}
              </div>
            )}
          </div>
        </DeviceFrame>
      </div>
    </div>
  );
}
