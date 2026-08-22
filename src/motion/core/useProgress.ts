import { useTimeline } from "./TimelineContext";
import { resolveBeatFrames } from "./beats";
import { applyEasing } from "./easing";
import { applySpring } from "./springs";
import type { Timing } from "./types";

/**
 * The single place frame -> progress (0..1) conversion happens (TODO.md B1).
 * Every primitive calls this instead of touching frame/fps itself.
 *
 * Clamps at both ends: before `delay` elapses -> exactly 0; at/after
 * `delay + duration` -> exactly 1. Between those two points the eased or
 * sprung curve MAY overshoot past 1 or dip below 0 (that overshoot is the
 * entire point of `spring: "bouncy"`) — only the two ends are pinned, so a
 * scene always settles into a stable final frame.
 */
export function useProgress(timing: Timing = {}): number {
  const { frame, fps } = useTimeline();
  const delayFrames = timing.delay != null ? resolveBeatFrames(timing.delay, fps) : 0;
  const durationFrames = Math.max(1, resolveBeatFrames(timing.duration ?? "normal", fps));

  const local = frame - delayFrames;
  if (local <= 0) return 0;
  if (local >= durationFrames) return 1;

  const t = local / durationFrames;
  if (timing.spring) return applySpring(t, timing.spring);
  return applyEasing(t, timing.easing ?? "standard");
}
