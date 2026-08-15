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
 * to the end-state frame and never starts the rAF loop — and keeps honouring
 * it, because the preference is a live `matchMedia` subscription rather than
 * a one-shot read at mount. Live mode only; the video path never sees it.
 *
 * Two performance invariants, both semantics-preserving (the frame a child
 * observes through `useTimeline()` is byte-identical either way — see the
 * showcase's 71 concurrently-mounted `MotionPreview`s, each of which used to
 * cost a permanent rAF loop plus a re-render per animation frame):
 *
 * 1. **The loop only runs while playing.** A paused driver schedules no
 *    rAF at all — `play()` (re)starts it, `tick` stops rescheduling the
 *    moment `playingRef` goes false. A paused clock never advanced anyway,
 *    so nothing downstream can tell the difference; what changes is that
 *    `PinnedFrame`, the Presenter's overview thumbnails and any
 *    off-screen-paused preview now cost literally zero per frame.
 * 2. **State commits are rounded-frame-gated.** `frameRef` still
 *    accumulates the true float (sub-frame precision is what keeps playback
 *    rate-accurate, and `onFrame` still reports it unrounded for logic
 *    consumers like `PresenterStage`'s seek-target comparison), but React
 *    state — the only thing children actually render from, already rounded
 *    at the provider — is written only when the *rounded* frame changes. On
 *    a 60/120Hz display that is a 2–4× cut in renders of the entire
 *    animated subtree, with an identical context value every time.
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
  const reducedMotionRef = useRef(prefersReducedMotion());
  const [frame, setFrame] = useState(reducedMotionRef.current ? durationInFrames : 0);
  const playingRef = useRef(!reducedMotionRef.current && autoPlay);
  const reverseRef = useRef(initialReverse);
  const rateRef = useRef(rate);
  /** The true, unrounded clock position — what playback accumulates into. */
  const frameRef = useRef(frame);
  /** The last rounded frame handed to React. See invariant 2 in the docblock. */
  const renderedRef = useRef(frame);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;
  // `tick` is reached through a ref so the loop never has to be torn down and
  // restarted when a prop (fps/duration/loop) changes identity — the running
  // rAF always calls the newest closure.
  const tickRef = useRef<(ts: number) => void>(() => {});

  const schedule = useCallback(() => {
    rafRef.current = requestAnimationFrame((ts) => tickRef.current(ts));
  }, []);

  const commitFrame = useCallback((next: number) => {
    frameRef.current = next;
    const rounded = Math.round(next);
    if (rounded !== renderedRef.current) {
      renderedRef.current = rounded;
      setFrame(rounded);
    }
    onFrameRef.current?.(next);
  }, []);

  const tick = useCallback(
    (ts: number) => {
      rafRef.current = null;
      // Paused (including pause() called from inside this very tick's own
      // onFrame consumer, e.g. PresenterStage stopping at a step boundary):
      // stop the loop instead of idling in it. play() restarts it.
      if (!playingRef.current) {
        lastTsRef.current = null;
        return;
      }
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
        schedule();
        return;
      }
      const dtSeconds = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;

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

      if (playingRef.current) schedule();
      else lastTsRef.current = null;
    },
    [fps, durationInFrames, loop, commitFrame, schedule],
  );
  tickRef.current = tick;

  // Idempotent: never stacks a second rAF on an already-running loop, and
  // always re-primes the timestamp so a resume never integrates the gap it
  // was paused for.
  const startLoop = useCallback(() => {
    lastTsRef.current = null;
    if (rafRef.current != null) return;
    schedule();
  }, [schedule]);

  useEffect(() => {
    if (playingRef.current) startLoop();
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [startLoop]);

  // Live `prefers-reduced-motion`. Reading it once at mount meant a reader who
  // turned the OS setting on mid-session kept every already-mounted preview
  // animating (and one who turned it off had to reload). Toggling it on parks
  // the clock on the end-state frame — the same thing a reduced-motion mount
  // does — and toggling it off resumes only what would have autoplayed.
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) {
        playingRef.current = false;
        commitFrame(durationInFrames);
      } else if (autoPlay) {
        playingRef.current = true;
        startLoop();
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [autoPlay, durationInFrames, commitFrame, startLoop]);

  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        // Under reduced motion the clock stays parked, exactly as it did when
        // the loop was simply never started at mount.
        if (reducedMotionRef.current) return;
        playingRef.current = true;
        startLoop();
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
    [durationInFrames, commitFrame, startLoop],
  );

  // `frame` is already the rounded value (commitFrame gates on it), so this
  // provider object changes identity only when a child could actually render
  // something different.
  return <TimelineProvider value={{ frame, fps, durationInFrames }}>{children}</TimelineProvider>;
});
