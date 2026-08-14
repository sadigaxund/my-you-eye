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
      // The first tick after mount — or after any play()/seek() call resets
      // lastTsRef to null — has no previous timestamp to diff against, so
      // dtSeconds/deltaFrames are meaningless zero here, not a real "no
      // movement this frame" reading. Priming lastTsRef and bailing before
      // the boundary check matters: without it, `next = frameRef.current +
      // 0` starting exactly at frame 0 satisfies `next <= 0` on this very
      // first tick, which the boundary logic below reads as "played
      // backward into frame 0, stop" and immediately sets playingRef.current
      // = false — pausing forward playback before it ever moves. Harmless
      // (masked) whenever `loop` is true (the non-loop-only pause branch
      // never fires), which is why every MotionPreview showcase demo
      // (loop=true by default) never showed this; Presenter's stage plays
      // with loop=false to hold at each step, so every scene entered at
      // frame 0 auto-paused on frame 1 — the scene's whole entrance
      // animation never advanced past its opacity-0/translated starting
      // state (owner report: "the controls work fine... I don't really see
      // the scenes").
      if (lastTsRef.current == null) {
        lastTsRef.current = ts;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
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
