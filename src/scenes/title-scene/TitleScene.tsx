import { cn } from "../../lib/cn";
import { Stagger } from "../../motion";
import { useSequence } from "../../motion/core";
import { sceneSteps } from "../timing";
import type { TitleScene as TitleSceneData } from "../schema";

export interface TitleSceneProps {
  scene: TitleSceneData;
}

const ALIGN_CLASS: Record<NonNullable<TitleSceneData["align"]>, string> = {
  center: "items-center text-center",
  left: "items-start text-left",
};

/**
 * Opening/chapter card (TODO.md Phase E). A single beat — `chapter`,
 * `title` and `subtitle` stagger in together, timed off the scene's own
 * (content-derived) duration via `sceneSteps`/`useSequence`, the same spine
 * `sceneDuration` uses for MP4 pacing. Props are `{ scene }` and nothing
 * else — no `className`/`style`/`children` (TODO.md §0/Phase H stability
 * contract: a scene is data in, a rendered frame out).
 */
export function TitleScene({ scene }: TitleSceneProps) {
  // A title scene is always exactly one step (see timing.ts's titleSteps),
  // so its range is simply the sole entry — reading it this way instead of
  // by a hardcoded key name never drifts if that step's name ever changes.
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const range = Object.values(ranges)[0];
  const align = scene.align ?? "center";

  return (
    <div className={cn("flex h-full w-full flex-col justify-center gap-stack bg-bg px-panel-xl text-fg", ALIGN_CLASS[align])}>
      <Stagger each="quick" delay={range.startFrame} duration="slow" revealFrom="up">
        {scene.chapter && (
          <span className="text-sm font-medium uppercase tracking-wide text-primary">{scene.chapter}</span>
        )}
        <h1 className="text-4xl font-bold text-fg">{scene.title}</h1>
        {scene.subtitle && <p className="text-lg text-muted">{scene.subtitle}</p>}
      </Stagger>
    </div>
  );
}
