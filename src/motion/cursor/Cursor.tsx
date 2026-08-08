import { useTimeline } from "../core/TimelineContext";
import { useProgress } from "../core/useProgress";
import { resolveBeatFrames } from "../core/beats";
import { colorVar } from "../core/tokens";
import { Ripple } from "../ripple";
import type { Timing, MotionColor } from "../core";

export type CursorAction = "click" | "dblclick" | "drag" | "type";

export interface CursorEvent {
  /** Frame this position/action is reached at. */
  at: number;
  x: number;
  y: number;
  action?: CursorAction;
  /** For action="type" — text shown near the cursor while it's active. */
  text?: string;
}

export type CursorProps = Timing & {
  /** Timed positions/actions, in frame order. Position between events is linearly interpolated. */
  events: CursorEvent[];
  color?: MotionColor;
  className?: string;
};

function interpolatePosition(events: CursorEvent[], frame: number): { x: number; y: number } {
  if (events.length === 0) return { x: 0, y: 0 };
  const first = events[0];
  if (frame <= first.at) return { x: first.x, y: first.y };
  const last = events[events.length - 1];
  if (frame >= last.at) return { x: last.x, y: last.y };

  let i = 0;
  while (i < events.length - 1 && events[i + 1].at < frame) i++;
  const a = events[i];
  const b = events[i + 1];
  const span = b.at - a.at;
  const t = span <= 0 ? 1 : (frame - a.at) / span;
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/**
 * A fake pointer that moves along `events` and renders a `Ripple` on
 * click/dblclick (TODO.md C5) — for simulated UI walkthroughs. `Timing`
 * controls the cursor's own entrance fade-in; each event's `at` is an
 * absolute frame within the mounted `MotionRoot`/`RemotionDriver` timeline,
 * consistent with `useSequence`'s frame ranges.
 */
export function Cursor({ events, color = "primary", className, ...timing }: CursorProps) {
  const entrance = useProgress(timing);
  const { frame, fps } = useTimeline();
  const pos = interpolatePosition(events, frame);

  const clickWindowFrames = resolveBeatFrames("quick", fps);
  const typeHoldFrames = resolveBeatFrames("slow", fps);

  const activeClick = events.find(
    (e) => (e.action === "click" || e.action === "dblclick") && frame >= e.at && frame < e.at + clickWindowFrames,
  );
  const activeType = [...events].reverse().find((e) => e.action === "type" && frame >= e.at && frame < e.at + typeHoldFrames);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: entrance }}>
      {activeClick && <Ripple x={activeClick.x} y={activeClick.y} color={color} duration="quick" />}
      <svg
        width={18}
        height={18}
        viewBox="0 0 18 18"
        style={{ position: "absolute", left: pos.x, top: pos.y, transform: "translate(-2px, -2px)" }}
      >
        <path
          d="M2 2 L2 15 L6 11.5 L8.5 16.5 L10.5 15.5 L8 10.5 L13 10.5 Z"
          fill={colorVar(color)}
          stroke="var(--color-surface)"
          strokeWidth={1}
        />
      </svg>
      {activeType?.text && (
        <div
          style={{ position: "absolute", left: pos.x + 16, top: pos.y + 16 }}
          className="rounded-ui-sm bg-surface-opaque px-tight py-compact-y text-xs text-fg shadow-card"
        >
          {activeType.text}
        </div>
      )}
    </div>
  );
}
