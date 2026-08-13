import { useTimeline } from "../core/TimelineContext";
import { useProgress } from "../core/useProgress";
import { resolveBeatFrames } from "../core/beats";
import { applyEasing } from "../core/easing";
import { applySpring } from "../core/springs";
import { colorVar } from "../core/tokens";
import { Ripple } from "../ripple";
import type { RippleVariant } from "../ripple";
import type { Timing, MotionColor } from "../core";

export type CursorAction = "click" | "dblclick" | "drag" | "type";
export type CursorShape = "arrow" | "hand" | "crosshair" | "dot";

export interface CursorEvent {
  /** Frame this position/action is reached at. */
  at: number;
  x: number;
  y: number;
  action?: CursorAction;
  /** For action="type" — text shown near the cursor while it's active. */
  text?: string;
  /** Overrides the Cursor's own `clickEffect` for just this click/dblclick. */
  effect?: RippleVariant;
}

export type CursorProps = Timing & {
  /** Timed positions/actions, in frame order. Position between events is linearly interpolated in time, but eased in motion (see `easing`/`spring` below) — never a raw constant-speed slide. */
  events: CursorEvent[];
  color?: MotionColor;
  /** Pointer appearance. Default "arrow". */
  shape?: CursorShape;
  /** Ripple treatment rendered on click/dblclick — forwarded straight to `Ripple`'s `variant`, never a second, hand-rolled click effect. Default "ring". */
  clickEffect?: RippleVariant;
  className?: string;
};

/**
 * Builds the same ease/spring shaping every other primitive gets from
 * `useProgress()` — Cursor can't use `useProgress()` itself for *movement*
 * (each leg between two events has its own start/span, not one fixed
 * delay+duration), so it applies the same `easing`/`spring` curve by hand
 * via `applyEasing`/`applySpring` instead of re-deriving a curve shape.
 * Owner feedback: raw constant-speed interpolation "feels robotic."
 */
function legEase(timing: Timing): (t: number) => number {
  if (timing.spring) {
    const spring = timing.spring;
    return (t: number) => Math.min(1, Math.max(0, applySpring(t, spring)));
  }
  const easing = timing.easing ?? "standard";
  return (t: number) => applyEasing(t, easing);
}

function interpolatePosition(events: CursorEvent[], frame: number, ease: (t: number) => number): { x: number; y: number } {
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
  const t = span <= 0 ? 1 : ease((frame - a.at) / span);
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// Each shape's own visual "hot point" — arrow/hand read from their tip
// (top-left corner of the 18x18 glyph); crosshair/dot are symmetric, so
// their hot point is the glyph's own center instead.
const HOTSPOT_OFFSET: Record<CursorShape, string> = {
  arrow: "translate(-2px, -2px)",
  hand: "translate(-2px, -2px)",
  crosshair: "translate(-9px, -9px)",
  dot: "translate(-9px, -9px)",
};

function CursorGlyph({ shape, color }: { shape: CursorShape; color: MotionColor }) {
  const fill = colorVar(color);
  const stroke = "var(--color-surface)";
  switch (shape) {
    case "hand":
      // A simplified pointing-hand/glove silhouette: a folded fist with one
      // extended index finger, the same rough "click here" read as a
      // native browser pointer cursor.
      return (
        <path
          d="M7 2.2 a1.1 1.1 0 0 1 2.2 0 V8.2 h0.5 a1.1 1.1 0 0 1 2.2 0 V9 h0.5 a1.1 1.1 0 0 1 2.2 0 V12.3 c0 2.4 -1.9 3.9 -4.3 3.9 H9.2 c-1.3 0 -2.2 -0.5 -2.9 -1.4 L3.9 11.6 a1 1 0 0 1 1.5 -1.3 L7 11.9 V2.2 Z"
          fill={fill}
          stroke={stroke}
          strokeWidth={0.75}
          strokeLinejoin="round"
        />
      );
    case "crosshair":
      return (
        <g stroke={fill} strokeWidth={1.4} strokeLinecap="round">
          <line x1="9" y1="1" x2="9" y2="6" />
          <line x1="9" y1="12" x2="9" y2="17" />
          <line x1="1" y1="9" x2="6" y2="9" />
          <line x1="12" y1="9" x2="17" y2="9" />
          <circle cx="9" cy="9" r="2.4" fill="none" />
        </g>
      );
    case "dot":
      return <circle cx="9" cy="9" r="5" fill={fill} stroke={stroke} strokeWidth={1} />;
    case "arrow":
    default:
      return <path d="M2 2 L2 15 L6 11.5 L8.5 16.5 L10.5 15.5 L8 10.5 L13 10.5 Z" fill={fill} stroke={stroke} strokeWidth={1} />;
  }
}

/**
 * A fake pointer that moves along `events` and renders a `Ripple` on
 * click/dblclick (TODO.md C5) — for simulated UI walkthroughs. `Timing`
 * controls the cursor's own entrance fade-in AND, reused rather than
 * duplicated, the easing/spring shape of its movement between events; each
 * event's `at` is an absolute frame within the mounted
 * `MotionRoot`/`RemotionDriver` timeline, consistent with `useSequence`'s
 * frame ranges.
 */
export function Cursor({ events, color = "primary", shape = "arrow", clickEffect = "ring", className, ...timing }: CursorProps) {
  const entrance = useProgress(timing);
  const { frame, fps } = useTimeline();
  const ease = legEase(timing);
  const pos = interpolatePosition(events, frame, ease);

  const clickWindowFrames = resolveBeatFrames("quick", fps);
  const typeHoldFrames = resolveBeatFrames("slow", fps);

  const activeClick = events.find(
    (e) => (e.action === "click" || e.action === "dblclick") && frame >= e.at && frame < e.at + clickWindowFrames,
  );
  const activeType = [...events].reverse().find((e) => e.action === "type" && frame >= e.at && frame < e.at + typeHoldFrames);

  return (
    <div className={className} style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: entrance }}>
      {activeClick && <Ripple x={activeClick.x} y={activeClick.y} color={color} variant={activeClick.effect ?? clickEffect} duration="quick" />}
      <svg
        width={18}
        height={18}
        viewBox="0 0 18 18"
        style={{ position: "absolute", left: pos.x, top: pos.y, transform: HOTSPOT_OFFSET[shape] }}
      >
        <CursorGlyph shape={shape} color={color} />
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
