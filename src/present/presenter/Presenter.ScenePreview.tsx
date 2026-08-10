import { useEffect, useRef } from "react";
import { MotionRoot } from "../../motion/core";
import type { DomDriverHandle } from "../../motion/core";
import { SceneRenderer } from "../../scenes";
import type { SceneTiming } from "../use-steps";

export interface PresenterScenePreviewProps {
  sceneTiming: SceneTiming;
}

/**
 * A still frame of a scene, pinned at its last frame, for the overview grid
 * (Esc). Reimplements the small seek-then-pause pattern
 * `src/showcase/PinnedFrame.tsx` also uses, rather than importing it —
 * `src/showcase/` is dev-only tooling, not one of `src/present/`'s allowed
 * import sources (TODO.md Phase F tier rules).
 *
 * Deliberately mounts no `LiveInteractionContext` provider: overview
 * thumbnails are navigation, not the live interactive view. Only
 * `PresenterStage` (the main stage) wires one up.
 */
export function PresenterScenePreview({ sceneTiming }: PresenterScenePreviewProps) {
  const handleRef = useRef<DomDriverHandle>(null);
  useEffect(() => {
    handleRef.current?.pause();
    handleRef.current?.seek(sceneTiming.durationInFrames);
  }, [sceneTiming.durationInFrames]);
  return (
    <MotionRoot
      ref={handleRef}
      mode="live"
      fps={sceneTiming.fps}
      durationInFrames={sceneTiming.durationInFrames}
      autoPlay={false}
    >
      <SceneRenderer scene={sceneTiming.scene} />
    </MotionRoot>
  );
}
