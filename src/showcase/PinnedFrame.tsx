import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { MotionRoot } from "../motion";
import type { DomDriverHandle } from "../motion";

export interface PinnedFrameProps {
  children: ReactNode;
  /** Frame to pause at. */
  frame: number;
  /** Total timeline length passed to the DomDriver. */
  durationInFrames: number;
  fps?: number;
}

/**
 * Mounts `children` under `<MotionRoot mode="live">` already paused at a
 * specific frame — for a showcase demo that needs a still frame a reviewer
 * can inspect without scrubbing (AGENTS.md §4 / TODO.md Phase E task brief),
 * as opposed to `MotionPreview`, which always autoplays. Drives `DomDriver`
 * directly via its imperative handle: `autoPlay={false}` keeps it from ever
 * starting, then a `seek()` on mount lands it exactly on `frame`.
 */
export function PinnedFrame({ children, frame, durationInFrames, fps }: PinnedFrameProps) {
  const handleRef = useRef<DomDriverHandle>(null);
  useEffect(() => {
    handleRef.current?.pause();
    handleRef.current?.seek(frame);
  }, [frame]);
  return (
    <MotionRoot ref={handleRef} mode="live" durationInFrames={durationInFrames} fps={fps} autoPlay={false}>
      {children}
    </MotionRoot>
  );
}
