import { Children, isValidElement } from "react";
import type { ReactNode } from "react";
import { Reveal } from "../reveal/Reveal";
import type { RevealFrom } from "../reveal/Reveal";
import { useTimeline } from "../core/TimelineContext";
import { resolveBeatFrames } from "../core/beats";
import type { Timing, Beat, DistanceToken } from "../core";

export type StaggerOrigin = "first" | "last" | "center";

export type StaggerProps = Timing & {
  children: ReactNode;
  /** Offset between successive children's reveals. Default "quick". */
  each?: Beat;
  /** Which child reveals first: index 0, index N-1, or the middle child outward. Default "first". */
  from?: StaggerOrigin;
  /** Forwarded to each child's Reveal. Default "up". */
  revealFrom?: RevealFrom;
  distance?: DistanceToken;
};

function originIndex(count: number, from: StaggerOrigin): number {
  if (from === "last") return count - 1;
  if (from === "center") return (count - 1) / 2;
  return 0;
}

/**
 * Orchestrates a per-child `Reveal` with offset timing (TODO.md B2). Renders
 * a Fragment — no wrapper element of its own, and each child gets its
 * animated style merged directly onto itself via `Reveal`'s `asChild`
 * (falling back to a bare `<span>` only for non-element children like raw
 * text), so Stagger never injects a layout box that could break a parent
 * flex/grid (the bug this replaces: the old version wrapped every child in
 * its own `<div>`).
 */
export function Stagger({
  children,
  each = "quick",
  from = "first",
  revealFrom = "up",
  distance = "md",
  ...timing
}: StaggerProps) {
  const { fps } = useTimeline();
  const items = Children.toArray(children);
  const origin = originIndex(items.length, from);
  const baseDelayFrames = timing.delay != null ? resolveBeatFrames(timing.delay, fps) : 0;
  const eachFrames = resolveBeatFrames(each, fps);

  return (
    <>
      {items.map((child, index) => {
        const rank = Math.abs(index - origin);
        const delayFrames = baseDelayFrames + Math.round(rank * eachFrames);
        const childTiming: Timing = timing.spring
          ? { delay: delayFrames, duration: timing.duration, spring: timing.spring }
          : { delay: delayFrames, duration: timing.duration, easing: timing.easing };

        if (isValidElement(child)) {
          return (
            <Reveal key={child.key ?? index} asChild from={revealFrom} distance={distance} {...childTiming}>
              {child}
            </Reveal>
          );
        }
        return (
          <Reveal key={index} from={revealFrom} distance={distance} as="span" {...childTiming}>
            {child}
          </Reveal>
        );
      })}
    </>
  );
}
