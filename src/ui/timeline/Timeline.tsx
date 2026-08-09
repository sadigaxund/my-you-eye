import { forwardRef, Fragment } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { StatusDot } from "../status-dot";

export type TimelineEventState = "done" | "active" | "pending" | "error";

export interface TimelineEvent {
  /** Position along the timeline. A plain ordering value — index, timestamp,
   * elapsed ms, whatever the data means. Only relative order/spacing is used;
   * `Timeline` never interprets it as a unit or draws an axis/scale. */
  at: number;
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
}

const STATE_VARIANT: Record<TimelineEventState, "success" | "info" | "neutral" | "danger"> = {
  done: "success", active: "info", pending: "neutral", error: "danger",
};

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

function Marker({ event }: { event: TimelineEvent }) {
  const state = event.state ?? "pending";
  return <StatusDot variant={STATE_VARIANT[state]} pulse={state === "active"} className="shrink-0" />;
}

function HorizontalLane({ lane, events, showLabel }: { lane: string; events: TimelineEvent[]; showLabel: boolean }) {
  const values = events.map((e) => e.at);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return (
    <div className="flex flex-col gap-tight">
      {showLabel && <span className="text-xs font-medium text-muted">{lane}</span>}
      <div className="relative h-14">
        <div className="absolute inset-x-0 top-3 border-t border-border" aria-hidden />
        {events.map((e, i) => {
          const pct = ((e.at - min) / span) * 100;
          return (
            <div
              key={i}
              className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-tight"
              style={{ left: `${pct}%` }}
            >
              <Marker event={e} />
              <span className="max-w-24 truncate text-xs text-fg" title={e.label}>{e.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VerticalLane({ lane, events, showLabel }: { lane: string; events: TimelineEvent[]; showLabel: boolean }) {
  return (
    <div className="min-w-0 flex-1">
      {showLabel && <span className="mb-stack block text-xs font-medium text-muted">{lane}</span>}
      <div className="flex flex-col">
        {events.map((e, i) => (
          <div key={i} className="relative flex gap-inline pb-stack last:pb-0">
            <div className="flex flex-col items-center">
              <Marker event={e} />
              {i < events.length - 1 && <span className="w-px flex-1 bg-border" aria-hidden />}
            </div>
            <div className="min-w-0 pb-tight">
              <p className="text-sm font-medium text-fg">{e.label}</p>
              {e.description && <p className="text-xs text-muted">{e.description}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  ({ className, events, orientation = "horizontal", lanes, ...props }, ref) => {
    const order = laneOrder(events, lanes);
    const showLabel = order.length > 1 || order[0] !== "";
    return (
      <div
        ref={ref}
        className={cn(orientation === "horizontal" ? "flex flex-col gap-panel" : "flex gap-panel-lg", className)}
        {...props}
      >
        {order.map((lane) => (
          <Fragment key={lane}>
            {orientation === "horizontal"
              ? <HorizontalLane lane={lane} events={byLane(events, lane)} showLabel={showLabel} />
              : <VerticalLane lane={lane} events={byLane(events, lane)} showLabel={showLabel} />}
          </Fragment>
        ))}
      </div>
    );
  },
);
Timeline.displayName = "Timeline";

export { Timeline };
