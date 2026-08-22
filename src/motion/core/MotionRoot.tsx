import { forwardRef } from "react";
import type { ComponentType, ReactNode } from "react";
import { DomDriver } from "./DomDriver";
import type { DomDriverHandle } from "./DomDriver";

export interface MotionRootLiveProps {
  mode: "live";
  children: ReactNode;
  fps?: number;
  durationInFrames?: number;
  autoPlay?: boolean;
  loop?: boolean;
  rate?: number;
  reverse?: boolean;
  onFrame?: (frame: number) => void;
}

export interface MotionRootVideoProps {
  mode: "video";
  children: ReactNode;
  /**
   * The video driver component. Pass `RemotionDriver`, imported from
   * `"my-you-eye/motion/remotion"` — that is the ONLY module allowed to
   * import `remotion` (TODO.md D1/2b). MotionRoot itself stays
   * remotion-free so it can ship in the default `my-you-eye/motion` entry
   * alongside every primitive, without pulling a video renderer into a
   * plain-UI consumer's bundle.
   */
  driver: ComponentType<{ children: ReactNode }>;
}

export type MotionRootProps = MotionRootLiveProps | MotionRootVideoProps;

/**
 * The single public entry point (TODO.md B1/D2). Mounts the right driver for
 * the mode: `DomDriver` directly for `"live"`, or whichever component you
 * pass as `driver` for `"video"` (in practice always `RemotionDriver`).
 * Every primitive downstream reads time exclusively through `useTimeline()`
 * — it never knows or cares which branch ran.
 *
 * The ref (only meaningful in `mode="live"`) exposes `DomDriverHandle` —
 * `play()` / `pause()` / `seek()` / `toggleReverse()` / `setRate()` — for
 * building scrub/replay UI around a live preview.
 */
export const MotionRoot = forwardRef<DomDriverHandle, MotionRootProps>(function MotionRoot(props, ref) {
  if (props.mode === "video") {
    const Driver = props.driver;
    return <Driver>{props.children}</Driver>;
  }
  const { children, fps, durationInFrames, autoPlay, loop, rate, reverse, onFrame } = props;
  return (
    <DomDriver
      ref={ref}
      fps={fps}
      durationInFrames={durationInFrames}
      autoPlay={autoPlay}
      loop={loop}
      rate={rate}
      reverse={reverse}
      onFrame={onFrame}
    >
      {children}
    </DomDriver>
  );
});
