import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, PointerEvent, ReactNode, Ref, RefObject } from "react";
import { cn } from "../../../lib/cn";
import { Badge } from "../../badge";
import { clamp } from "../../../lib/math";

export interface ComparisonProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** "side-by-side" (default): two columns. "wipe": before/after stacked with a draggable reveal divider. */
  mode?: "side-by-side" | "wipe";
  /** Controlled divider position, 0-100 (wipe mode only). */
  value?: number;
  /** Uncontrolled initial divider position, 0-100. Default 50. */
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /**
   * 0→1 animation-in progress (TODO.md D4's progress-in convention) — lets
   * a video/live scene animate the reveal without ever importing
   * src/motion/. In "wipe" mode it takes over the divider position
   * entirely (`pct = progress * 100`) and disables dragging, since the
   * divider is then a pure function of this prop rather than of drag
   * state. In "side-by-side" mode it WIPES the `after` column in with a
   * left-to-right `clip-path` — never an opacity fade, so no border in
   * that column is ever drawn at partial alpha (see the comment at the
   * render site for why that distinction is the whole fix). Omitted falls
   * back to the interactive value/defaultValue divider (wipe) / a fully
   * revealed column (side-by-side).
   */
  progress?: number;
}

function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-icon fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 5 2 8l3 3M11 5l3 3-3 3" />
    </svg>
  );
}

/**
 * The container's own content width and column gap, in whole pixels,
 * measured off the real element with a `ResizeObserver` — the same
 * "measure, never assume" pattern `CodeBlock.useHighlightOverlay` and
 * `CodeDiff`'s line metrics already use.
 *
 * It exists because everything this component reveals is bounded by a 1px
 * `border-border` hairline, and a hairline only survives rasterisation when
 * the edge it sits on lands on a whole pixel. Two things here put it on a
 * fraction: a `clip-path` expressed as a percentage of a container whose
 * width is not a multiple of 100, and a `grid-cols-2` whose `1fr` tracks
 * split an odd pixel count in half. Both produce a seam that cuts straight
 * through a code pane's header separator, so it draws for part of its
 * length and vanishes for the rest.
 *
 * `clientWidth` (not `offsetWidth`) is the number both consumers need: the
 * wipe layer is `absolute inset-0`, so it spans the padding box, and the
 * grid lays its tracks in the content box. Zero means "nothing measured
 * yet" — server render, first client frame — and every caller falls back to
 * the percentage form until a real number arrives.
 */
function useContainerMetrics(ref: RefObject<HTMLDivElement | null>, mode: string): { width: number; gap: number } {
  const [metrics, setMetrics] = useState({ width: 0, gap: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const width = el.clientWidth;
      const gap = Math.round(parseFloat(getComputedStyle(el).columnGap) || 0);
      setMetrics((prev) => (prev.width === width && prev.gap === gap ? prev : { width, gap }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
    // `mode` is a dependency because the two branches below render different
    // elements: without it, switching mode would leave the observer attached
    // to the unmounted container from the previous branch.
  }, [ref, mode]);
  return metrics;
}

/** `inset(0 …% 0 0)` snapped to a whole pixel once the pane has been
 * measured, so the clip edge never lands mid-pixel. Falls back to the
 * percentage form while `width` is still 0. */
function revealClip(width: number, pct: number): string {
  if (width <= 0) return `inset(0 ${100 - pct}% 0 0)`;
  return `inset(0 ${Math.round(width - (width * pct) / 100)}px 0 0)`;
}

function setRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") (ref as { current: T | null }).current = node;
    }
  };
}

const Comparison = forwardRef<HTMLDivElement, ComparisonProps>(
  (
    {
      className, before, after, beforeLabel, afterLabel, mode = "side-by-side",
      value, defaultValue = 50, onValueChange, progress, ...props
    },
    ref,
  ) => {
    const [internal, setInternal] = useState(defaultValue);
    const containerRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);

    const animated = progress !== undefined;
    const pct = animated ? clamp(progress * 100, 0, 100) : (value ?? internal);
    const { width, gap } = useContainerMetrics(containerRef, mode);

    function setPct(next: number) {
      const clamped = clamp(next, 0, 100);
      if (value === undefined) setInternal(clamped);
      onValueChange?.(clamped);
    }

    function onPointerDown(e: PointerEvent<HTMLDivElement>) {
      if (animated) return;
      draggingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e: PointerEvent<HTMLDivElement>) {
      if (!draggingRef.current || !containerRef.current) return;
      const width = containerRef.current.offsetWidth || 1;
      setPct(pct + (e.movementX / width) * 100);
    }
    function onPointerUp(e: PointerEvent<HTMLDivElement>) {
      draggingRef.current = false;
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
      if (animated) return;
      if (e.key === "ArrowLeft") { setPct(pct - 2); e.preventDefault(); }
      else if (e.key === "ArrowRight") { setPct(pct + 2); e.preventDefault(); }
      else if (e.key === "Home") { setPct(0); e.preventDefault(); }
      else if (e.key === "End") { setPct(100); e.preventDefault(); }
    }

    if (mode === "side-by-side") {
      // Only while a reveal clip is running: `1fr 1fr` hands each track half
      // of whatever odd pixel count the column happens to have, and the
      // half-pixel track edge is one of the two places the header hairline
      // breaks up (the clip edge is the other). Pinning both tracks to a
      // whole-pixel width — with the gap rounded too, so track 2 starts on an
      // integer as well — takes the fraction out of both. The static
      // side-by-side has no clip sweeping across it and keeps the plain
      // `1fr 1fr` grid.
      const pane = width > 0 ? Math.floor((width - gap) / 2) : 0;
      const snapped = animated && pane > 0;
      return (
        <div
          ref={setRefs(ref, containerRef)}
          className={cn("grid grid-cols-2 gap-panel", className)}
          {...props}
          style={
            snapped
              ? { ...props.style, gridTemplateColumns: `${pane}px ${pane}px`, columnGap: `${gap}px` }
              : props.style
          }
        >
          <div className="flex flex-col gap-tight min-w-0">
            {beforeLabel && <Badge variant="neutral" className="self-start">{beforeLabel}</Badge>}
            <div className="overflow-hidden rounded-ui border border-border">{before}</div>
          </div>
          {/* A CLIP, not an opacity fade. Fading the column dims every pixel
              in it uniformly, and a 1px `border-border` hairline — the code
              pane's header separator especially — falls below the eye's
              threshold long before the text does. So mid-reveal the pane
              looked like a box whose separator had glitched out rather than
              like a pane fading in, and syncing the fade across the whole
              column (the previous attempt) could not fix that: the problem is
              partial alpha itself, not which elements share it. A clip means
              every pixel that is drawn is drawn at full strength. */}
          <div
            className="flex flex-col gap-tight min-w-0"
            style={animated ? { clipPath: revealClip(pane, pct) } : undefined}
          >
            {afterLabel && <Badge variant="primary" className="self-start">{afterLabel}</Badge>}
            <div className="overflow-hidden rounded-ui border border-border">{after}</div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={setRefs(ref, containerRef)}
        className={cn("relative select-none overflow-hidden rounded-ui border border-border", className)}
        {...props}
      >
        <div className="relative">{before}</div>
        {/* `bg-surface-opaque` (the same token TableHeader's sticky background
            uses — guaranteed non-translucent in every theme, unlike `bg-surface`)
            — without it this layer has no background of its own, so `before`
            shows straight through wherever `after`'s own content doesn't fully
            paint over it (e.g. a lighter surface, gaps around text). */}
        <div className="absolute inset-0 bg-surface-opaque" style={{ clipPath: revealClip(width, pct) }}>
          {after}
        </div>
        {beforeLabel && <Badge variant="neutral" className="absolute left-2 top-2 z-10">{beforeLabel}</Badge>}
        {afterLabel && <Badge variant="primary" className="absolute right-2 top-2 z-10">{afterLabel}</Badge>}
        {!animated && (
          <div
            role="slider"
            tabIndex={0}
            aria-label="Comparison divider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            className="absolute inset-y-0 z-20 flex w-6 -translate-x-1/2 cursor-ew-resize flex-col items-center justify-center outline-none"
            style={{ left: `${pct}%` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onKeyDown={onKeyDown}
          >
            <span className="absolute inset-y-0 w-0.5 bg-surface shadow-elevated" aria-hidden />
            <span className="relative flex size-thumb items-center justify-center rounded-full border border-border bg-surface text-fg shadow-card">
              <GripIcon />
            </span>
          </div>
        )}
      </div>
    );
  },
);
Comparison.displayName = "Comparison";

export { Comparison };
