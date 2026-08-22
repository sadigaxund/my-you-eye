import { cn } from "../../lib/cn";
import { StatusDot } from "../status-dot";
import type { TimelineEvent, TimelineEventState, TimelineDensity, TimelineLabelPlacement } from "./Timeline";

// The two lane renderers plus the axis, split out of Timeline.tsx to keep
// each file under the repo's 250-line guideline (AGENTS.md §2). Timeline.tsx
// owns the props, the shared scale and the playhead; this file owns nothing
// but markup and the geometry that follows from a scale it is handed.

const STATE_VARIANT: Record<TimelineEventState, "success" | "info" | "neutral" | "danger"> = {
  done: "success", active: "info", pending: "neutral", error: "danger",
};

// Mirrors STATE_VARIANT's colours, but resolved to actual tokens: there is
// no `--color-info`, so StatusDot's "info" variant is itself `bg-primary`.
// Writing `bg-info` here produced a class Tailwind emits nothing for, and
// the active span simply had no bar.
const STATE_BAR: Record<TimelineEventState, string> = {
  done: "bg-success/70",
  active: "bg-primary/70",
  pending: "bg-muted/40",
  error: "bg-danger/70",
};

/** A scale over the whole timeline, shared by every lane. */
export interface TimelineScale {
  min: number;
  span: number;
  /** Position of the reveal playhead in `at` units; `Infinity` when progress is 1. */
  head: number;
}

export function pct(at: number, scale: TimelineScale): number {
  return ((at - scale.min) / scale.span) * 100;
}

/**
 * How visible an event is given the playhead. A short fade rather than a
 * hard cut so a timeline animating under `progress` doesn't pop each event
 * into existence — the fade window is a fraction of the domain, so it reads
 * the same regardless of what unit `at` is in.
 */
export function reveal(at: number, scale: TimelineScale): number {
  if (scale.head === Infinity) return 1;
  const fade = scale.span * 0.04 || 1;
  return Math.max(0, Math.min(1, (scale.head - at) / fade));
}

function Marker({ event }: { event: TimelineEvent }) {
  const state = event.state ?? "pending";
  return <StatusDot variant={STATE_VARIANT[state]} pulse={state === "active"} className="shrink-0" />;
}

export interface LaneProps {
  lane: string;
  events: TimelineEvent[];
  showLabel: boolean;
  scale: TimelineScale;
  density: TimelineDensity;
  labelPlacement: TimelineLabelPlacement;
}

export function HorizontalLane({ lane, events, showLabel, scale, density, labelPlacement }: LaneProps) {
  const compact = density === "compact";
  // `stagger` alternates labels above and below the rule. Point events are
  // positioned proportionally to `at`, so any two close together collide —
  // and the labels are the widest part of an event by far. Alternating
  // guarantees neighbours can never overlap without measuring anything,
  // which matters because these render inside Canvas's scaled layer where
  // getBoundingClientRect is the wrong tool anyway (AGENTS.md §7).
  const stagger = labelPlacement === "stagger";
  return (
    <div className="flex flex-col gap-tight">
      {showLabel && <span className="text-xs font-medium text-muted">{lane}</span>}
      <div className={cn("relative", stagger ? (compact ? "h-16" : "h-20") : compact ? "h-10" : "h-14")}>
        <div
          className={cn("absolute inset-x-0 border-t border-border", stagger ? "top-1/2" : "top-3")}
          aria-hidden
        />
        {events.map((e, i) => {
          const opacity = reveal(e.at, scale);
          if (opacity <= 0) return null;
          const left = pct(e.at, scale);
          // A spanning event is clipped at the playhead, so a bar visibly
          // grows as `progress` advances instead of appearing whole.
          const end = e.until != null ? Math.min(e.until, scale.head) : null;
          const width = end != null ? Math.max(0, pct(end, scale) - left) : null;
          const above = stagger && i % 2 === 1;
          return (
            <div key={i} className="contents">
              {width != null && (
                <div
                  aria-hidden
                  className={cn("absolute h-1.5 rounded-full", STATE_BAR[e.state ?? "pending"], stagger ? "top-1/2" : "top-3")}
                  style={{ left: `${left}%`, width: `${width}%`, marginTop: -3, opacity }}
                />
              )}
              <div
                className={cn(
                  "absolute flex -translate-x-1/2 items-center gap-tight",
                  above ? "bottom-1/2 flex-col-reverse pb-1" : stagger ? "top-1/2 flex-col pt-1" : "top-0 flex-col",
                )}
                style={{ left: `${left}%`, opacity }}
              >
                <Marker event={e} />
                <span className="max-w-24 truncate text-xs text-fg" title={e.label}>{e.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VerticalLane({ lane, events, showLabel, scale, density }: LaneProps) {
  const compact = density === "compact";
  return (
    <div className="min-w-0 flex-1">
      {showLabel && <span className="mb-stack block text-xs font-medium text-muted">{lane}</span>}
      <div className="flex flex-col">
        {events.map((e, i) => {
          const opacity = reveal(e.at, scale);
          if (opacity <= 0) return null;
          return (
            <div
              key={i}
              className={cn("relative flex gap-inline last:pb-0", compact ? "pb-tight" : "pb-stack")}
              style={{ opacity }}
            >
              <div className="flex flex-col items-center">
                <Marker event={e} />
                {i < events.length - 1 && <span className="w-px flex-1 bg-border" aria-hidden />}
              </div>
              <div className={cn("min-w-0", compact ? "pb-0" : "pb-tight")}>
                <p className={cn("font-medium text-fg", compact ? "text-xs" : "text-sm")}>{e.label}</p>
                {e.description && !compact && <p className="text-xs text-muted">{e.description}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Tick axis for a horizontal timeline. Off by default — `at` is documented
 * as "a plain ordering value", and labelling raw ordering values as if they
 * were a measured quantity would be a lie. Turn it on (with a formatter)
 * only when `at` genuinely carries a unit.
 */
export function Axis({ scale, format, ticks = 5 }: { scale: TimelineScale; format: (at: number) => string; ticks?: number }) {
  const marks = Array.from({ length: ticks }, (_, i) => scale.min + (scale.span * i) / (ticks - 1));
  return (
    <div className="relative h-5 border-t border-border/60">
      {marks.map((at, i) => (
        <span
          key={i}
          className={cn(
            "absolute top-1 text-[10px] tabular-nums text-muted",
            // The end ticks would otherwise hang off both sides of the lane.
            i === 0 ? "left-0" : i === marks.length - 1 ? "right-0" : "-translate-x-1/2",
          )}
          style={i === 0 || i === marks.length - 1 ? undefined : { left: `${pct(at, scale)}%` }}
        >
          {format(at)}
        </span>
      ))}
    </div>
  );
}
