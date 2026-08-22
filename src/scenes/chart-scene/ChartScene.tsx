import { CountUp } from "../../motion";
import { useProgress, useSequence, useTimeline } from "../../motion/core";
import type { SequenceRange } from "../../motion/core";
import { sceneSteps, stepName } from "../timing";
import { resolveCountUpFormat } from "../format";
import { ChartRender } from "./ChartScene.Chart";
import type { ChartScene as ChartSceneData, ChartStep } from "../schema";

export interface ChartSceneProps {
  scene: ChartSceneData;
}

function currentIndex(steps: ChartStep[], ranges: Record<string, SequenceRange>, frame: number): number {
  let index = 0;
  steps.forEach((step, i) => {
    if (frame >= ranges[stepName(step.id, i)].startFrame) index = i;
  });
  return index;
}

/**
 * Wraps whichever chart `ChartSpec.type` selects (`ChartScene.Chart.tsx`),
 * driving its `progress` prop (TODO.md Phase E) — "charts own their own
 * reveal" (TODO.md D2), this scene only decides *when* content becomes
 * visible and hands the chart a single `progress` number, never redraws a
 * bar/line/slice by hand.
 *
 * `ChartStep.series` accumulates: once a step names a series it stays
 * revealed for every later step (`revealedLabels` is the running union).
 * Every chart component here exposes exactly one `progress` that scales
 * *every* currently-included mark uniformly — there's no per-series
 * progress to ask for — so the step that actually adds new series redraws
 * the whole chart (old marks included) over its own duration; steps that
 * only set `focus`/`callout` leave `progress` at 1 (already settled). A
 * scene that never sets `series` on any step instead draws the *entire*
 * chart on once, over the first step's own range, and stays fully drawn
 * for every step after that — exactly `ChartStep.series`'s own doc comment
 * ("the whole chart draws on over the scene's first step").
 */
export function ChartScene({ scene }: ChartSceneProps) {
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const { frame } = useTimeline();

  const steps = scene.steps ?? [];
  const hasSteps = steps.length > 0;
  const index = hasSteps ? currentIndex(steps, ranges, frame) : 0;
  const step = hasSteps ? steps[index] : undefined;
  const range = hasSteps ? ranges[stepName(step!.id, index)] : Object.values(ranges)[0];
  const stepProgress = useProgress({ delay: range.startFrame, duration: Math.max(1, range.endFrame - range.startFrame) });

  const firstRange = Object.values(ranges)[0];
  const wholeChartProgress = useProgress({ delay: firstRange.startFrame, duration: Math.max(1, firstRange.endFrame - firstRange.startFrame) });

  const seriesEverNamed = steps.some((s) => s.series && s.series.length > 0);
  const revealedLabels = seriesEverNamed
    ? steps.slice(0, index + 1).flatMap((s) => s.series ?? [])
    : undefined;
  const progress = !seriesEverNamed ? wholeChartProgress : step?.series && step.series.length > 0 ? stepProgress : 1;

  const callout = step?.callout;
  const { format: countFormat, formatOptions } = resolveCountUpFormat(callout?.format);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-stack bg-bg p-panel-xl text-fg">
      <div className="relative w-full max-w-3xl">
        <ChartRender
          chart={scene.chart}
          title={scene.title}
          subtitle={scene.subtitle}
          revealedLabels={revealedLabels}
          progress={progress}
          focus={step?.focus}
        />
        {callout && (
          <div className="absolute right-2 top-2 flex flex-col items-end gap-tight rounded-ui border border-border bg-canvas-surface px-3 py-2 shadow-card">
            <span className="text-xs text-muted">{callout.label}</span>
            <span className="text-2xl font-bold tabular-nums text-fg">
              <CountUp to={callout.value} format={countFormat} formatOptions={formatOptions} delay={range.startFrame} duration={Math.max(1, range.endFrame - range.startFrame)} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
