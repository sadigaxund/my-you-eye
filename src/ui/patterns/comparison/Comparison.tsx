import { forwardRef, useRef, useState } from "react";
import type { HTMLAttributes, KeyboardEvent, PointerEvent, ReactNode, Ref } from "react";
import { cn } from "../../../lib/cn";
import { Badge } from "../../badge";

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
   * 0→1 animation-in progress for the wipe divider (TODO.md D4's
   * progress-in convention) — lets a video/live scene animate the reveal
   * without ever importing src/motion/. When provided it takes over the
   * divider position entirely (`pct = progress * 100`) and disables
   * dragging, since the divider is then a pure function of this prop
   * rather than of drag state. Omitted falls back to the interactive
   * value/defaultValue divider. No effect in "side-by-side" mode.
   */
  progress?: number;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function GripIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-icon fill-none stroke-current" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 5 2 8l3 3M11 5l3 3-3 3" />
    </svg>
  );
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
      return (
        <div ref={ref} className={cn("grid grid-cols-2 gap-panel", className)} {...props}>
          <div className="flex flex-col gap-tight min-w-0">
            {beforeLabel && <Badge variant="neutral" className="self-start">{beforeLabel}</Badge>}
            <div className="overflow-hidden rounded-ui border border-border">{before}</div>
          </div>
          <div className="flex flex-col gap-tight min-w-0">
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
        <div className="absolute inset-0 bg-surface-opaque" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
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
