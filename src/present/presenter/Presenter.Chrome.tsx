import type { MouseEvent, ReactNode } from "react";
import { Button } from "../../ui/button";
import { Kbd } from "../../ui/kbd";
import { Progress } from "../../ui/progress";

export interface PresenterChromeProps {
  index: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  isFullscreen: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToggleFullscreen: () => void;
  onOpenOverview: () => void;
  onOpenSpeakerView: () => void;
}

/** Wraps a chrome button's click so it never bubbles to the stage's
 * "click background to advance" handler above it. */
function stopAnd(fn: () => void) {
  return (e: MouseEvent) => {
    e.stopPropagation();
    fn();
  };
}

function Hint({ keyLabel, children }: { keyLabel: string; children: ReactNode }) {
  return (
    <span className="hidden items-center gap-1 sm:inline-flex">
      <Kbd>{keyLabel}</Kbd> {children}
    </span>
  );
}

/** Bottom chrome bar: progress, prev/next, and the overview/speaker-view/
 * fullscreen controls, each mirroring a keyboard shortcut. */
export function PresenterChrome({
  index,
  total,
  isFirst,
  isLast,
  isFullscreen,
  onPrev,
  onNext,
  onToggleFullscreen,
  onOpenOverview,
  onOpenSpeakerView,
}: PresenterChromeProps) {
  return (
    <div className="flex shrink-0 flex-col gap-tight border-t border-border bg-surface p-panel" onClick={(e) => e.stopPropagation()}>
      <Progress value={total > 0 ? ((index + 1) / total) * 100 : 0} />
      <div className="flex items-center justify-between gap-panel">
        <div className="flex items-center gap-inline">
          <Button size="sm" variant="ghost" onClick={stopAnd(onPrev)} disabled={isFirst}>
            ← Prev
          </Button>
          <Button size="sm" variant="ghost" onClick={stopAnd(onNext)} disabled={isLast}>
            Next →
          </Button>
          <span className="font-mono text-xs text-muted">
            {total > 0 ? index + 1 : 0} / {total}
          </span>
        </div>
        <div className="flex items-center gap-panel">
          <div className="flex items-center gap-panel text-xs text-muted">
            <Hint keyLabel="Esc">overview</Hint>
            <Hint keyLabel="F">fullscreen</Hint>
          </div>
          <Button size="sm" variant="ghost" onClick={stopAnd(onOpenSpeakerView)}>
            Speaker view
          </Button>
          <Button size="sm" variant="ghost" onClick={stopAnd(onOpenOverview)}>
            Overview
          </Button>
          <Button size="sm" variant="ghost" onClick={stopAnd(onToggleFullscreen)}>
            {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          </Button>
        </div>
      </div>
    </div>
  );
}
