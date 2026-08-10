import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../ui/dialog";
import { ScrollArea } from "../../ui/scroll-area";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { sceneLabel } from "../label";
import { PresenterScenePreview } from "./Presenter.ScenePreview";
import type { SceneTiming } from "../use-steps";

export interface PresenterOverviewProps {
  scenes: SceneTiming[];
  activeSceneIndex: number;
  onSelect: (sceneIndex: number) => void;
  onClose: () => void;
}

/**
 * `Esc` overview grid (TODO.md Phase F): every scene as a still thumbnail
 * pinned at its last frame, click to jump. Built from `Dialog` — the width
 * override (`w-[90vw] max-w-6xl`) is a layout-only className at the call
 * site (AGENTS.md §1 Step B), not a new variant, since a scene grid needs
 * far more width than Dialog's own sm/md/lg content sizes assume.
 */
export function PresenterOverview({ scenes, activeSceneIndex, onSelect, onClose }: PresenterOverviewProps) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="flex h-[85vh] w-[90vw] max-w-6xl flex-col">
        <DialogHeader>
          <DialogTitle>Scenes</DialogTitle>
        </DialogHeader>
        <ScrollArea className="min-h-0 flex-1" orientation="vertical">
          <div className="grid grid-cols-2 gap-panel p-1 sm:grid-cols-3">
            {scenes.map((s) => (
              <Card
                key={s.sceneIndex}
                variant={s.sceneIndex === activeSceneIndex ? "outlined" : "default"}
                className="flex cursor-pointer flex-col gap-tight p-tight hover:border-primary"
                onClick={() => onSelect(s.sceneIndex)}
              >
                <div className="aspect-video w-full overflow-hidden rounded-ui-sm border border-border">
                  <PresenterScenePreview sceneTiming={s} />
                </div>
                <div className="flex items-center justify-between gap-inline">
                  <span className="truncate text-xs font-medium">
                    {s.sceneIndex + 1}. {sceneLabel(s.scene)}
                  </span>
                  <Badge variant="neutral">{s.scene.kind}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
