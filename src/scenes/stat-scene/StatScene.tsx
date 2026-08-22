import { CountUp } from "../../motion";
import { useSequence, useTimeline, applyEasing, resolveBeatFrames } from "../../motion/core";
import type { SequenceRange } from "../../motion/core";
import { StatGrid } from "../../ui/patterns/stat-grid";
import type { StatGridItem } from "../../ui/patterns/stat-grid";
import { sceneSteps, stepName } from "../timing";
import { resolveCountUpFormat } from "../format";
import type { StatScene as StatSceneData } from "../schema";

export interface StatSceneProps {
  scene: StatSceneData;
}

/** A tile's own entrance progress, 0→1 — the same clamp/ease `useProgress`
 * applies, computed by hand (`applyEasing` is a pure function, safe to call
 * per-tile inside a `.map()`; `useProgress` itself is a hook and cannot be
 * called a variable number of times per render). */
function entranceProgress(range: SequenceRange, frame: number, fps: number): number {
  const durationFrames = Math.max(1, resolveBeatFrames("normal", fps));
  const local = frame - range.startFrame;
  if (local <= 0) return 0;
  if (local >= durationFrames) return 1;
  return applyEasing(local / durationFrames, "standard");
}

/**
 * `StatGrid` with per-tile staggered `CountUp`, `delta` arrows (respecting
 * `positiveIsGood`) and an inline `Sparkline` (TODO.md Phase E). Each
 * `StatItem` is its own step — "a stat scene reads as a sequence of claims
 * rather than a wall of numbers" (scenes.data.ts) — so a tile fades in and
 * its number starts counting up exactly at its own step's start frame,
 * from `useSequence(sceneSteps(scene), scene.pace)`, the same spine every
 * other scene uses.
 *
 * `StatCard.value` was widened `string -> ReactNode` and `StatGridItem`
 * gained an optional `style` passthrough specifically so this scene could
 * drop a live `CountUp` into a data-only grid without either scene forking
 * `StatGrid`'s layout or `StatGrid` importing motion (AGENTS.md §9b keeps
 * `src/ui/` motion-free either way — only the *scene* imports `CountUp`).
 */
export function StatScene({ scene }: StatSceneProps) {
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const { frame, fps } = useTimeline();

  const items: StatGridItem[] = scene.stats.map((stat, i) => {
    const range = ranges[stepName(stat.id, i)];
    const p = entranceProgress(range, frame, fps);
    const { format, formatOptions } = resolveCountUpFormat(stat.format);
    const duration = Math.max(1, range.endFrame - range.startFrame);

    return {
      label: stat.label,
      value: stat.value != null
        ? <CountUp to={stat.value} format={format} formatOptions={formatOptions} delay={range.startFrame} duration={duration} />
        : (stat.text ?? ""),
      delta: stat.delta != null ? { value: stat.delta, positiveIsGood: stat.positiveIsGood ?? true } : undefined,
      sparkline: stat.sparkline ? { data: stat.sparkline, progress: p } : undefined,
      style: { opacity: p },
    };
  });

  return (
    <div className="flex h-full w-full flex-col justify-center gap-stack bg-bg p-panel-xl text-fg">
      {scene.heading && <h2 className="text-2xl font-semibold text-fg">{scene.heading}</h2>}
      <StatGrid items={items} columns={scene.columns ?? 4} />
    </div>
  );
}
