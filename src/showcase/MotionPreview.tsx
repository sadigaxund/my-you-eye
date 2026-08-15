import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { MotionRoot, TimelineProvider, useTimeline, resolveBeatFrames } from "../motion";
import type { DomDriverHandle } from "../motion";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { cn } from "../lib/cn";
import { observeOnScreen, observeTabVisible } from "./MotionPreview.gate";

export interface MotionPreviewProps {
  children: ReactNode;
  /** Length of the preview loop, in frames. */
  durationInFrames?: number;
  fps?: number;
  /** Loop back to the start automatically. Default true — a showcase demo should keep playing without being re-triggered. */
  loop?: boolean;
  /**
   * Centre the rendered content within the preview box instead of letting it
   * sit flush at the box's block-start/inline-start corner (owner feedback:
   * "centralize the presented elements within their container" — CountUp
   * and several other demos sat flush left with visible unused space).
   * `ShowcaseEntry.demos[].layout: "center"` centers the *whole* preview
   * (chrome, controls and all) within the outer showcase panel, which is a
   * no-op here because MotionPreview's own box is already `w-full` — this
   * prop centers content within that box instead, which is the container
   * the feedback actually meant. Default false — preserves every demo that
   * intentionally fills the box (grids, full-bleed panels, positioned
   * overlays).
   */
  center?: boolean;
  /**
   * Hold on frame 0 for about a second before the clock actually starts
   * advancing for `children` (owner feedback, generalized from Unmask:
   * "the presentation starts improperly... a second of delay at the start
   * to see the [before] state then [animate] it" — a reveal-type demo that
   * begins already mid-reveal never shows its own starting state). Only
   * shifts what `children` perceive as `frame` — the scrub bar below still
   * reports the real, unshifted frame, so manual scrubbing isn't affected.
   * Default false.
   */
  leadIn?: boolean;
}

// ~0.9s at the default 30fps — reuses the "slow" semantic Beat instead of a
// magic frame count, same as every primitive's own Timing.
const LEAD_IN_BEAT = "slow" as const;

/**
 * How often the *chrome* (scrub thumb + frame readout) refreshes, in updates
 * per second. The animation itself keeps running at full fps inside
 * `MotionRoot` — this only throttles MotionPreview's own display state.
 *
 * Without it every preview re-rendered twice per driver tick: once for the
 * driver's own frame commit and once more for this component, whose state
 * change re-renders the whole `MotionRoot` subtree a second time. A frame
 * counter that ticks 10×/s is indistinguishable from one that ticks 30×/s to
 * a reader, and costs a third as many renders.
 */
const CHROME_FPS = 10;

function LeadInGate({ fps, children }: { fps: number; children: ReactNode }) {
  const { frame, durationInFrames } = useTimeline();
  const leadFrames = resolveBeatFrames(LEAD_IN_BEAT, fps);
  return (
    <TimelineProvider value={{ frame: Math.max(0, frame - leadFrames), fps, durationInFrames }}>
      {children}
    </TimelineProvider>
  );
}

/**
 * Showcase-only chrome: mounts children under `<MotionRoot mode="live">` and
 * renders a play/pause/replay/scrub control strip driven by the DomDriver
 * imperative handle. Every motion primitive showcase demo wraps its example
 * in this so a human can actually scrub and replay it (task brief 2e).
 *
 * Deliberately lives in src/showcase/, not src/motion/: it imports Button
 * and Slider from src/ui/, which src/motion/** is not allowed to depend on
 * (AGENTS.md §9c rule 3 / eslint tier boundary). Motion showcase files
 * import this the same way they already import ShowcaseEntry from
 * "../../showcase/types" — showcase infrastructure, not a primitive.
 */
export function MotionPreview({ children, durationInFrames = 90, fps = 30, loop = true, center = false, leadIn = false }: MotionPreviewProps) {
  const handleRef = useRef<DomDriverHandle>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);

  // Three independent gates decide whether the driver runs: what the reader
  // asked for, whether the preview is on screen, and whether the tab is
  // foregrounded. A preview the reader paused must stay paused when it
  // scrolls back into view, so "resume" is `wantsPlay && onScreen && tabVisible`
  // rather than a bare play() on re-entry.
  const wantsPlayRef = useRef(true);
  const onScreenRef = useRef(true);
  const tabVisibleRef = useRef(true);

  const syncPlayback = useCallback(() => {
    if (wantsPlayRef.current && onScreenRef.current && tabVisibleRef.current) handleRef.current?.play();
    else handleRef.current?.pause();
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const unobserve = observeOnScreen(el, (visible) => {
      onScreenRef.current = visible;
      syncPlayback();
    });
    const untrack = observeTabVisible((visible) => {
      tabVisibleRef.current = visible;
      syncPlayback();
    });
    return () => {
      unobserve();
      untrack();
    };
  }, [syncPlayback]);

  const setWantsPlay = (next: boolean) => {
    wantsPlayRef.current = next;
    setPlaying(next);
    syncPlayback();
  };

  // Display-only frame, throttled to CHROME_FPS (see the constant). The
  // endpoints always land exactly, so a non-looping preview never rests on a
  // stale "87/90".
  const chromeStep = Math.max(1, Math.round(fps / CHROME_FPS));
  const shownFrameRef = useRef(0);
  const showFrame = useCallback(
    (next: number) => {
      shownFrameRef.current = next;
      setFrame(next);
    },
    [],
  );
  const handleDriverFrame = useCallback(
    (raw: number) => {
      const rounded = Math.round(raw);
      const atEdge = rounded === 0 || rounded === durationInFrames;
      if (rounded === shownFrameRef.current) return;
      if (!atEdge && Math.abs(rounded - shownFrameRef.current) < chromeStep) return;
      showFrame(rounded);
    },
    [chromeStep, durationInFrames, showFrame],
  );

  const content = leadIn ? <LeadInGate fps={fps}>{children}</LeadInGate> : children;

  return (
    <div className="flex w-full flex-col gap-tight">
      <div
        ref={stageRef}
        className={cn(
          // contain-paint: the stage is already an overflow-hidden box, so
          // scoping its paint changes nothing visually — but it stops each
          // animating preview from dirtying the page-level (textured,
          // backdrop-filtered) compositing layer behind it.
          "relative w-full overflow-hidden contain-paint rounded-ui border border-border bg-surface p-panel",
          center && "flex items-center justify-center",
        )}
      >
        <MotionRoot
          ref={handleRef}
          mode="live"
          durationInFrames={durationInFrames}
          fps={fps}
          loop={loop}
          autoPlay
          // DomDriver's `onFrame` intentionally reports the raw, unrounded
          // rAF-accumulated frame (real sub-frame precision, useful to a
          // logic consumer like the Presenter's seek-target comparison) —
          // TimelineContext is the one place that rounds it for rendering.
          // This showcase readout is a *display*, not animation logic, so
          // round here at the boundary rather than showing e.g.
          // "40.99800000000001/120" (owner-reported: "the float large
          // precision displayed on the slider's values… For example: Motion
          // > Beat" — reproduced on Pulse/Spotlight too; every MotionPreview
          // instance shares this one readout).
          onFrame={handleDriverFrame}
        >
          {content}
        </MotionRoot>
      </div>
      <div className="flex items-center gap-inline">
        <Button
          size="sm"
          variant={playing ? "secondary" : "primary"}
          onClick={() => setWantsPlay(!playing)}
        >
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            handleRef.current?.seek(0);
            showFrame(0);
            setWantsPlay(true);
          }}
        >
          Replay
        </Button>
        <Slider
          className="flex-1"
          size="sm"
          value={frame}
          min={0}
          max={durationInFrames}
          step={1}
          onChange={(e) => {
            const next = Number(e.target.value);
            setWantsPlay(false);
            handleRef.current?.seek(next);
            // The thumb is controlled by `frame`, so a drag has to write the
            // display state directly — the throttled driver feed would drop
            // the small deltas a slow drag produces and the thumb would stick.
            showFrame(next);
          }}
        />
        <span className="w-16 shrink-0 text-right font-mono text-xs text-muted">
          {frame}/{durationInFrames}
        </span>
      </div>
    </div>
  );
}
