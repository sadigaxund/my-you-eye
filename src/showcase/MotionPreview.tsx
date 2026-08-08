import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { MotionRoot } from "../motion";
import type { DomDriverHandle } from "../motion";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";

export interface MotionPreviewProps {
  children: ReactNode;
  /** Length of the preview loop, in frames. */
  durationInFrames?: number;
  fps?: number;
  /** Loop back to the start automatically. Default true — a showcase demo should keep playing without being re-triggered. */
  loop?: boolean;
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
export function MotionPreview({ children, durationInFrames = 90, fps = 30, loop = true }: MotionPreviewProps) {
  const handleRef = useRef<DomDriverHandle>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);

  return (
    <div className="flex w-full flex-col gap-tight">
      <div className="relative w-full overflow-hidden rounded-ui border border-border bg-surface p-panel">
        <MotionRoot
          ref={handleRef}
          mode="live"
          durationInFrames={durationInFrames}
          fps={fps}
          loop={loop}
          autoPlay
          onFrame={setFrame}
        >
          {children}
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
