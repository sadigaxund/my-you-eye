// Public entry point: `my-you-eye/motion/remotion`. This is the ONLY module
// in the whole package allowed to import "remotion" (TODO.md D1/2b). It is
// a single file, not a folder, deliberately: `scripts/check-showcase.mjs`
// requires a showcase for every *directory* under src/motion/ that
// contains a component file, and RemotionDriver has no meaningful
// standalone browser showcase (it only renders inside a real Remotion
// frame-capture context) — driver agreement is instead proven by rendering
// an MP4 and comparing it against the DomDriver-seeked live preview at the
// same frame (see apps/video and the batch report, TODO.md B1 acceptance).
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { ReactNode } from "react";
import { TimelineProvider } from "./core/TimelineContext";

export interface RemotionDriverProps {
  children: ReactNode;
}

/**
 * Video driver for `<MotionRoot mode="video" driver={RemotionDriver}>`.
 * Calls `useCurrentFrame()` / `useVideoConfig()` at its own top level — no
 * primitive downstream ever calls a Remotion hook directly, so there is
 * exactly one place in the whole codebase with a conditional dependency on
 * which driver is mounted (AGENTS.md §9c rule 2: no conditional hooks).
 */
export function RemotionDriver({ children }: RemotionDriverProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  return <TimelineProvider value={{ frame, fps, durationInFrames }}>{children}</TimelineProvider>;
}
