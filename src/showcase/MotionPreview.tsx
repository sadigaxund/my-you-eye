import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { MotionRoot, TimelineProvider, useTimeline, resolveBeatFrames } from "../motion";
import type { DomDriverHandle } from "../motion";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { cn } from "../lib/cn";

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
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);

  const content = leadIn ? <LeadInGate fps={fps}>{children}</LeadInGate> : children;

  return (
    <div className="flex w-full flex-col gap-tight">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-ui border border-border bg-surface p-panel",
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
          onFrame={(f) => setFrame(Math.round(f))}
        >
          {content}
        </MotionRoot>
      </div>
      <div className="flex items-center gap-inline">
        <Button
          size="sm"
          variant={playing ? "secondary" : "primary"}
          onClick={() => {
            if (playing) {
              handleRef.current?.pause();
              setPlaying(false);
            } else {
              handleRef.current?.play();
              setPlaying(true);
            }
          }}
        >
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            handleRef.current?.seek(0);
            handleRef.current?.play();
            setPlaying(true);
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
            handleRef.current?.pause();
            setPlaying(false);
            handleRef.current?.seek(next);
          }}
        />
        <span className="w-16 shrink-0 text-right font-mono text-xs text-muted">
          {frame}/{durationInFrames}
        </span>
      </div>
    </div>
  );
}
