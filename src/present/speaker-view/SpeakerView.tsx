import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { useSteps } from "../use-steps";
import type { PresentStep } from "../use-steps";
import { sceneLabel } from "../label";
import { useElapsedSeconds } from "./SpeakerView.useElapsed";
import type { Video } from "../../scenes";

export interface SpeakerViewProps {
  video: Video;
  /** Currently-showing scene, as an index into `video.scenes` — the same
   * position `Presenter` (or a consumer's own `useSteps`-driven UI) is at. */
  sceneIndex: number;
  /** Currently-showing step, as an index into that scene's own step list. */
  stepIndex: number;
  className?: string;
}

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function SpeakerPane({ title, step, emphasis }: { title: string; step: PresentStep | undefined; emphasis?: boolean }) {
  return (
    <div className={cn("flex min-h-0 flex-col gap-tight rounded-ui border border-border p-panel", emphasis ? "bg-surface" : "bg-bg opacity-dim")}>
      <div className="flex items-center justify-between gap-inline">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</span>
        {step && <Badge variant="neutral">{sceneLabel(step.scene)}</Badge>}
      </div>
      {step ? (
        <p className="text-sm text-fg">{step.content ?? <span className="text-muted">(no narration for this step)</span>}</p>
      ) : (
        <p className="text-sm text-muted">End of presentation.</p>
      )}
      {step?.scene.notes && (
        <p className="mt-auto border-t border-border pt-tight text-xs text-muted">{step.scene.notes}</p>
      )}
    </div>
  );
}

/**
 * Current + next step side by side, an elapsed timer, and notes from
 * `step.say` / `scene.notes` (via `PresentStep.content`, which prefers
 * `say` — see `useSteps`) — TODO.md Phase F. A plain, controlled component
 * (`sceneIndex`/`stepIndex` props, not its own driver): it derives its own
 * step list from `video` via `useSteps`, so it never needs a live
 * `MotionRoot` or a shared driver reference with whatever is rendering the
 * audience-facing view. That's what lets it be opened in a second window —
 * `Presenter.useSpeakerWindow.ts` portals it into a popup, and the portal
 * re-renders with fresh props exactly like any other React subtree.
 */
export function SpeakerView({ video, sceneIndex, stepIndex, className }: SpeakerViewProps): ReactNode {
  const fps = video.meta?.fps ?? 30;
  const { steps } = useSteps(video, { fps });
  const currentGlobalIndex = steps.findIndex((s) => s.sceneIndex === sceneIndex && s.stepIndex === stepIndex);
  const current = currentGlobalIndex >= 0 ? steps[currentGlobalIndex] : steps[0];
  const next = current ? steps[current.index + 1] : undefined;
  const elapsed = useElapsedSeconds(true);

  const theme = video.meta?.theme ?? "default";
  const appearance = video.meta?.appearance ?? "dark";
  const font = video.meta?.font ?? "sans";

  if (!current) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-bg text-muted">No steps to present.</div>
    );
  }

  return (
    <div
      data-theme={theme === "default" ? undefined : theme}
      data-font={font}
      className={cn("flex h-full w-full flex-col gap-panel bg-bg p-panel-xl text-fg", appearance === "dark" && "dark", className)}
    >
      <div className="flex items-center justify-between">
        <Badge variant="primary">
          Step {current.index + 1} / {steps.length}
        </Badge>
        <span className="font-mono text-sm text-muted">{formatElapsed(elapsed)}</span>
      </div>
      <Separator />
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-panel">
        <SpeakerPane title="Now" step={current} emphasis />
        <SpeakerPane title="Next" step={next} />
      </div>
    </div>
  );
}
