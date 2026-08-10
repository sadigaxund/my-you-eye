import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionRoot } from "../../motion/core";
import type { DomDriverHandle } from "../../motion/core";
import { SceneRenderer, LiveInteractionContext } from "../../scenes";
import type { LiveInteractionValue } from "../../scenes";
import type { PresentStep, SceneTiming } from "../use-steps";

export interface PresenterStageProps {
  sceneTiming: SceneTiming;
  current: PresentStep;
}

/**
 * Mounts exactly one scene's `SceneRenderer` under a live `MotionRoot`,
 * seeked so the current step's animation plays (forward when advancing,
 * reversed when navigating backward within the scene — `DomDriverHandle`'s
 * `toggleReverse`) and then holds at that step's end frame (TODO.md Phase
 * F: "seeking the driver so the current step's animation plays and then
 * holds"). The caller (`Presenter.tsx`) remounts this component on every
 * scene change via `key={sceneTiming.sceneIndex}`, so the DomDriver's frame
 * counter and this component's own direction bookkeeping both start fresh
 * every time — no state bleeds from one scene's driver into the next's.
 *
 * Known simplification: entering a scene by pressing "prev" past its first
 * step always plays that scene forward from frame 0 to its last step's held
 * state (a fresh DomDriver always starts at 0) rather than truly reversing
 * in from the end. Visually it still lands on the right content; only the
 * direction of the last leg differs from a literal reverse-scrub-in.
 *
 * Also the ONLY place a real `LiveInteractionContext` provider is mounted
 * (TODO.md D2) — Presenter's overview grid renders scene thumbnails with no
 * provider, so those stay inert/non-interactive by construction, same as a
 * video render.
 */
export function PresenterStage({ sceneTiming, current }: PresenterStageProps) {
  const driverRef = useRef<DomDriverHandle>(null);
  const frameRef = useRef(0);
  const directionRef = useRef<"forward" | "backward">("forward");
  const targetFrame = current.range.endFrame;

  useEffect(() => {
    const handle = driverRef.current;
    if (!handle) return;
    const from = frameRef.current;
    if (targetFrame === from) return;
    directionRef.current = targetFrame > from ? "forward" : "backward";
    handle.toggleReverse(directionRef.current === "backward");
    handle.play();
  }, [targetFrame]);

  const handleFrame = useCallback(
    (f: number) => {
      frameRef.current = f;
      const dir = directionRef.current;
      if ((dir === "forward" && f >= targetFrame) || (dir === "backward" && f <= targetFrame)) {
        driverRef.current?.pause();
      }
    },
    [targetFrame],
  );

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const liveValue = useMemo<LiveInteractionValue>(
    () => ({
      isLive: true,
      hoveredNodeId,
      expandedNodeId,
      onNodeHover: setHoveredNodeId,
      onNodeClick: (id) => setExpandedNodeId((cur) => (cur === id ? null : id)),
    }),
    [hoveredNodeId, expandedNodeId],
  );

  return (
    <MotionRoot
      ref={driverRef}
      mode="live"
      fps={sceneTiming.fps}
      durationInFrames={sceneTiming.durationInFrames}
      autoPlay={false}
      onFrame={handleFrame}
    >
      <LiveInteractionContext.Provider value={liveValue}>
        <SceneRenderer scene={sceneTiming.scene} />
      </LiveInteractionContext.Provider>
    </MotionRoot>
  );
}
