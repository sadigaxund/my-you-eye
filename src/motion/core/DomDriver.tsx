import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ReactNode } from "react";
import { TimelineProvider } from "./TimelineContext";

export interface DomDriverHandle {
  play: () => void;
  pause: () => void;
  /** Jump to an absolute frame, clamped to [0, durationInFrames]. */
  seek: (frame: number) => void;
  /** Flip (or explicitly set) playback direction. */
  toggleReverse: (reverse?: boolean) => void;
  /** Change the playback rate multiplier. */
  setRate: (rate: number) => void;
}

export interface DomDriverProps {
  children: ReactNode;
  /** Frames per second the exposed `frame` value advances at. Default 30 — matches this library's default video fps, so mode="live" and mode="video" agree without extra config. */
  fps?: number;
  /** Total length of the clock; playback and seeking clamp to [0, durationInFrames]. */
  durationInFrames?: number;
  /** Autoplay on mount. Default true. */
  autoPlay?: boolean;
  /** Loop back to the start (or end, if reversed) instead of stopping. Default false. */
  loop?: boolean;
  /** Playback rate multiplier. Default 1. */
  rate?: number;
  /** Start already reversed. Default false. */
  reverse?: boolean;
  /** Called on every frame update — lets a host (e.g. a showcase scrub bar) mirror playback position without polling. */
  onFrame?: (frame: number) => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * requestAnimationFrame clock driver for `mode="live"` (TODO.md B1/D2).
 * Provides the same TimelineContext shape RemotionDriver does, so every
 * primitive downstream is unaware which driver is mounted.
 *
 * Honours `prefers-reduced-motion`: instead of animating, it jumps straight
 * to the end-state frame and never starts the rAF loop.
 */
export const DomDriver = forwardRef<DomDriverHandle, DomDriverProps>(function DomDriver(
  {
    children,
    fps = 30,
    durationInFrames = 300,
    autoPlay = true,
    loop = false,
    rate = 1,
    reverse: initialReverse = false,
    onFrame,
  },
  ref,
) {
  const reducedMotion = useRef(prefersReducedMotion()).current;
  const [frame, setFrame] = useState(reducedMotion ? durationInFrames : 0);
  const playingRef = useRef(!reducedMotion && autoPlay);
  const reverseRef = useRef(initialReverse);
  const rateRef = useRef(rate);
  const frameRef = useRef(frame);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const commitFrame = useCallback((next: number) => {
    frameRef.current = next;
    setFrame(next);
    onFrameRef.current?.(next);
  }, []);

  const tick = useCallback(
    (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dtSeconds = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

      if (playingRef.current) {
        const deltaFrames = dtSeconds * fps * rateRef.current * (reverseRef.current ? -1 : 1);
        let next = frameRef.current + deltaFrames;
        if (next >= durationInFrames) {
          next = loop ? ((next % durationInFrames) + durationInFrames) % durationInFrames : durationInFrames;
          if (!loop) playingRef.current = false;
        } else if (next <= 0) {
          next = loop ? ((next % durationInFrames) + durationInFrames) % durationInFrames : 0;
          if (!loop) playingRef.current = false;
        }
        commitFrame(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    },
    [fps, durationInFrames, loop, commitFrame],
  );

  useEffect(() => {
    if (reducedMotion) return undefined;
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [tick, reducedMotion]);

  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        playingRef.current = true;
        lastTsRef.current = null;
      },
      pause: () => {
        playingRef.current = false;
      },
      seek: (target: number) => {
        const clamped = Math.min(durationInFrames, Math.max(0, target));
        lastTsRef.current = null;
        commitFrame(clamped);
      },
      toggleReverse: (value?: boolean) => {
        reverseRef.current = value ?? !reverseRef.current;
      },
      setRate: (next: number) => {
        rateRef.current = next;
      },
    }),
    [durationInFrames, commitFrame],
  );

  return (
    <TimelineProvider value={{ frame: Math.round(frame), fps, durationInFrames }}>{children}</TimelineProvider>
  );
});
