import type { ReactNode } from "react";
import { useTimeline } from "../core/TimelineContext";
import { useProgress } from "../core/useProgress";
import { resolveBeatFrames } from "../core/beats";
import { legEase } from "../core/legEase";
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
  /** Pointer appearance. Default "arrow". Ignored when `children` is supplied. */
  shape?: CursorShape;
  /** Ripple treatment rendered on click/dblclick — forwarded straight to `Ripple`'s `variant`, never a second, hand-rolled click effect. Default "ring". */
  clickEffect?: RippleVariant;
  /**
   * Escape hatch: a custom cursor node (an icon, an avatar, anything)
   * replacing the built-in `shape` glyph entirely — `shape`/`color` are
   * then ignored for the glyph itself (though `color` still tints the
   * click `Ripple`). Centered on the tracked position by default (the same
   * "symmetric hotspot" convention `shape="dot"`/`"crosshair"` already use)
   * since an arbitrary node has no predictable "tip" the way a drawn arrow
   * or hand does — pass your own `className`/`style` on the child to
   * offset it if you need a different hotspot.
   */
  children?: ReactNode;
  className?: string;
};

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
      // A pointing-hand silhouette built from separated, bold primitives
      // (own extended index finger + 2 folded-knuckle bumps + a palm/thumb
      // path) rather than one intricate path — at an 18x18 glyph size a
      // single thin outline collapses into an unreadable blob (owner
      // feedback round 2: "I don't like the new hand cursor variation…
      // the current one doesn't [read as a pointing hand] at small sizes").
      // Each finger is its own rounded capsule with real gaps between them,
      // the same "bold, few, distinct shapes" read a native OS link/pointer
      // cursor uses at icon size.
      return (
        <g fill={fill} stroke={stroke} strokeWidth={0.75} strokeLinejoin="round" strokeLinecap="round">
          {/* extended index finger, pointing straight up */}
          <rect x="6.3" y="1.6" width="2.4" height="8.4" rx="1.2" />
          {/* two folded knuckles (middle + ring/pinky) stepped down to the side */}
          <rect x="8.9" y="5.6" width="2.3" height="6" rx="1.15" />
          <rect x="11.4" y="6.6" width="2.2" height="5.4" rx="1.1" />
          {/* palm + thumb */}
          <path d="M4.7 11.9 c-.55 -.7 -1.65 -1.55 -.75 -2.4 c.7 -.65 1.55 -.35 2.15 .35 l.8 .95 v-1.1 h7.2 v3.1 c0 2.35 -1.85 3.7 -4.15 3.7 h-1.5 c-1.25 0 -2.15 -.45 -2.8 -1.35 Z" />
        </g>
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
export function Cursor({ events, color = "primary", shape = "arrow", clickEffect = "ring", children, className, ...timing }: CursorProps) {
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
      {children ? (
        <div style={{ position: "absolute", left: pos.x, top: pos.y, transform: "translate(-50%, -50%)" }}>
          {children}
        </div>
      ) : (
        <svg
          width={18}
          height={18}
          viewBox="0 0 18 18"
          style={{ position: "absolute", left: pos.x, top: pos.y, transform: HOTSPOT_OFFSET[shape] }}
        >
          <CursorGlyph shape={shape} color={color} />
        </svg>
      )}
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
