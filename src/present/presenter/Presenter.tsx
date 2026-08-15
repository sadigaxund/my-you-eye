import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/cn";
import type { Video } from "../../scenes";
import { useSteps } from "../use-steps";
import { SpeakerView } from "../speaker-view";
import { PresenterStage } from "./Presenter.Stage";
import { PresenterChrome } from "./Presenter.Chrome";
import { PresenterOverview } from "./Presenter.Overview";
import { usePresenterKeyboard } from "./Presenter.useKeyboard";
import { usePresenterFullscreen } from "./Presenter.useFullscreen";
import { useSpeakerWindow } from "./Presenter.useSpeakerWindow";

export interface PresenterStepInfo {
  sceneIndex: number;
  stepIndex: number;
  globalIndex: number;
}

export interface PresenterProps {
  video: Video;
  className?: string;
  /** Called whenever the active step changes — for a consumer syncing their
   * own chrome (e.g. a `SpeakerView` they've opened some other way) to
   * Presenter's position. Presenter's own built-in "Speaker view" button
   * (see `useSpeakerWindow`) doesn't need this — it portals a `SpeakerView`
   * straight into a popup and lets React re-rendering handle the rest. */
  onStepChange?: (info: PresenterStepInfo) => void;
}

/**
 * `<Presenter video={video} />` (TODO.md Phase F) — step-through
 * presentation of a `Video`. `→` / `Space` advances a step, `←`
 * reverses, `Esc` opens an overview grid, `f` toggles fullscreen; the
 * Prev/Next buttons in the chrome do the same. The stage itself does NOT
 * advance on click, so a scene can own its own pointer interactions.
 *
 * Renders exactly one scene at a time through `SceneRenderer` under a live
 * `MotionRoot` (`PresenterStage`), seeked so the current step's animation
 * plays and then holds — see that file for the driver/direction logic.
 * Steps come from `useSteps`, the same `sceneSteps`/`buildSequence` spine
 * `VideoRoot` (Phase G) will use for the MP4, so pacing can't drift between
 * the two.
 */
export function Presenter({ video, className, onStepChange }: PresenterProps) {
  const fps = video.meta?.fps ?? 30;
  const { steps, scenes, index, current, isFirst, isLast, next, prev, goToScene } = useSteps(video, { fps });
  const [overviewOpen, setOverviewOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isFullscreen, toggleFullscreen } = usePresenterFullscreen(containerRef);
  const { popup, openSpeakerWindow } = useSpeakerWindow(video.meta?.title);

  usePresenterKeyboard({
    onNext: next,
    onPrev: prev,
    onToggleOverview: () => setOverviewOpen((o) => !o),
    onToggleFullscreen: toggleFullscreen,
  });

  const onStepChangeRef = useRef(onStepChange);
  onStepChangeRef.current = onStepChange;
  useEffect(() => {
    if (!current) return;
    onStepChangeRef.current?.({ sceneIndex: current.sceneIndex, stepIndex: current.stepIndex, globalIndex: current.index });
  }, [current]);

  const handleSelectScene = useCallback(
    (sceneIndex: number) => {
      goToScene(sceneIndex);
      setOverviewOpen(false);
    },
    [goToScene],
  );

  if (!current) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg text-muted">No scenes to present.</div>
    );
  }

  const sceneTiming = scenes[current.sceneIndex];
  const theme = video.meta?.theme ?? "default";
  const appearance = video.meta?.appearance ?? "dark";
  const font = video.meta?.font ?? "sans";

  return (
    <div
      ref={containerRef}
      data-theme={theme === "default" ? undefined : theme}
      data-font={font}
      className={cn("flex h-full w-full flex-col overflow-hidden bg-bg text-fg", appearance === "dark" && "dark", className)}
    >
      {/* The stage takes no click handler of its own. It used to advance on
          any click, which made every interactive scene unusable: dragging a
          `DiagramScene` canvas, or grabbing a `Comparison` divider, ends in a
          click on the stage and the slide jumped forward mid-gesture.
          Advancing is the Chrome's Prev/Next buttons and the keyboard
          (Space / arrows), both of which are unambiguous. */}
      <div className="relative min-h-0 flex-1">
        <PresenterStage key={sceneTiming.sceneIndex} sceneTiming={sceneTiming} current={current} />
      </div>
      <PresenterChrome
        index={index}
        total={steps.length}
        isFirst={isFirst}
        isLast={isLast}
        isFullscreen={isFullscreen}
        onPrev={prev}
        onNext={next}
        onToggleFullscreen={toggleFullscreen}
        onOpenOverview={() => setOverviewOpen(true)}
        onOpenSpeakerView={openSpeakerWindow}
      />
      {overviewOpen && (
        <PresenterOverview
          scenes={scenes}
          activeSceneIndex={current.sceneIndex}
          onSelect={handleSelectScene}
          onClose={() => setOverviewOpen(false)}
        />
      )}
      {popup &&
        createPortal(
          <SpeakerView video={video} sceneIndex={current.sceneIndex} stepIndex={current.stepIndex} className="h-full" />,
          popup.root,
        )}
    </div>
  );
}
