import { forwardRef, Fragment, useMemo } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Axis, HorizontalLane, VerticalLane } from "./Timeline.lanes";
import type { TimelineScale } from "./Timeline.lanes";

export type TimelineEventState = "done" | "active" | "pending" | "error";
export type TimelineDensity = "comfortable" | "compact";
export type TimelineLabelPlacement = "stagger" | "below";

export interface TimelineEvent {
  /** Position along the timeline. A plain ordering value — index, timestamp,
   * elapsed ms, whatever the data means. Only relative order/spacing is used;
   * `Timeline` never interprets it as a unit (see `axis`, which is off by
   * default for exactly that reason). */
  at: number;
  /** End position, for an event that occupies a span rather than happening at
   * an instant. Renders as a bar from `at` to `until` with the marker at its
   * start — a request trace, a deploy window, a roadmap item. Omit for a
   * point event (the original behaviour). */
  until?: number;
  label: string;
  description?: string;
  /** Groups events into a parallel track. Omit for a single-lane timeline. */
  lane?: string;
  state?: TimelineEventState;
}

export interface TimelineProps extends HTMLAttributes<HTMLDivElement> {
  events: TimelineEvent[];
  /** "horizontal" (default): lanes stack as rows, events spaced proportionally
   * to `at` along the row — for roadmaps and request traces. "vertical":
   * lanes sit as columns, events stack sequentially top-to-bottom — for a
   * git-history/changelog read. */
  orientation?: "horizontal" | "vertical";
  /** Explicit lane display order. Defaults to first-seen order of `event.lane`
   * (a single unnamed lane when no event sets one). */
  lanes?: string[];
  /** Row height and text scale. `compact` also drops event descriptions in
   * the vertical orientation — at that density they're what overflows. */
  density?: TimelineDensity;
  /** Horizontal only. `"stagger"` (default) alternates labels above and below
   * the rule so neighbouring events can't collide; `"below"` puts them all
   * under it, which is tighter but only safe when events are well separated. */
  labelPlacement?: TimelineLabelPlacement;
  /** Horizontal only. Draws a tick axis under the lanes. Off by default
   * because `at` is just an ordering value; pass a formatter when it
   * genuinely carries a unit (e.g. `(ms) => `${ms}ms``). */
  axis?: (at: number) => string;
  /** 0→1 reveal (TODO.md D4's progress-in convention). Acts as a playhead
   * over the `at` domain rather than an item counter: events appear when the
   * head passes their `at`, and a spanning event's bar is clipped at the
   * head, so it grows instead of popping in whole. Omitted or 1 = fully
   * revealed, identical to before this prop existed. Pure function of
   * `progress`; no internal timer. */
  progress?: number;
}

function laneOrder(events: TimelineEvent[], explicit?: string[]): string[] {
  if (explicit) return explicit;
  const seen: string[] = [];
  for (const e of events) {
    const lane = e.lane ?? "";
    if (!seen.includes(lane)) seen.push(lane);
  }
  return seen.length > 0 ? seen : [""];
}

function byLane(events: TimelineEvent[], lane: string): TimelineEvent[] {
  return events.filter((e) => (e.lane ?? "") === lane).sort((a, b) => a.at - b.at);
}

const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  (
    {
      className, events, orientation = "horizontal", lanes,
      density = "comfortable", labelPlacement = "stagger", axis, progress = 1,
      ...props
    },
    ref,
  ) => {
    const order = laneOrder(events, lanes);
    const showLabel = order.length > 1 || order[0] !== "";

    // ONE scale for the whole timeline, not one per lane. Each lane used to
    // compute its own min/max, which silently rescaled every lane to its own
    // extent — so on a multi-lane timeline (the entire point of `lane`) two
    // events with the SAME `at` landed at different x positions, and a lane
    // whose events happened to share one `at` stretched that single instant
    // across the full width. Parallel tracks are only readable against a
    // shared axis.
    const scale = useMemo<TimelineScale>(() => {
      const values = events.flatMap((e) => (e.until != null ? [e.at, e.until] : [e.at]));
      const min = values.length > 0 ? Math.min(...values) : 0;
      const max = values.length > 0 ? Math.max(...values) : 1;
      const span = max - min || 1;
      const p = Math.max(0, Math.min(1, progress));
      // Exactly 1 means "no playhead at all" rather than "head at max", so a
      // fully-revealed timeline never runs anything through the fade math.
      return { min, span, head: p >= 1 ? Infinity : min + span * p };
    }, [events, progress]);

    const horizontal = orientation === "horizontal";
    return (
      <div
        ref={ref}
        className={cn(horizontal ? "flex flex-col gap-panel" : "flex gap-panel-lg", className)}
        {...props}
      >
        {order.map((lane) => (
          <Fragment key={lane}>
            {horizontal ? (
              <HorizontalLane
                lane={lane} events={byLane(events, lane)} showLabel={showLabel}
                scale={scale} density={density} labelPlacement={labelPlacement}
              />
            ) : (
              <VerticalLane
                lane={lane} events={byLane(events, lane)} showLabel={showLabel}
                scale={scale} density={density} labelPlacement={labelPlacement}
              />
            )}
          </Fragment>
        ))}
        {horizontal && axis && <Axis scale={scale} format={axis} />}
      </div>
    );
  },
);
Timeline.displayName = "Timeline";

export { Timeline };
