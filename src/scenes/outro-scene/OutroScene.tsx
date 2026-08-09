import { cn } from "../../lib/cn";
import { Stagger } from "../../motion";
import { useSequence } from "../../motion/core";
import { Link } from "../../ui/link";
import { sceneSteps } from "../timing";
import type { OutroScene as OutroSceneData } from "../schema";

export interface OutroSceneProps {
  scene: OutroSceneData;
}

/**
 * End card (TODO.md Phase E): title, subtitle, a link list and a closing
 * call to action, staggering in together over the scene's own
 * content-derived duration — the same single-beat shape `TitleScene` uses,
 * mirrored for the close of a video instead of the open. Links render via
 * `Link` (`src/ui/link`), the styled-`<a>` primitive this batch adds — a
 * scene may never hand-roll a native element itself (AGENTS.md §0 rule 1).
 */
export function OutroScene({ scene }: OutroSceneProps) {
  // A single beat, same as TitleScene/CompareScene — see timing.ts's outroSteps.
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const range = Object.values(ranges)[0];

  return (
    <div className={cn("flex h-full w-full flex-col items-center justify-center gap-stack bg-bg px-panel-xl text-center text-fg")}>
      <Stagger each="quick" delay={range.startFrame} duration="slow" revealFrom="up">
        {scene.title && <h1 className="text-3xl font-bold text-fg">{scene.title}</h1>}
        {scene.subtitle && <p className="text-lg text-muted">{scene.subtitle}</p>}
        {scene.links && scene.links.length > 0 && (
          <ul className="flex flex-wrap items-center justify-center gap-panel">
            {scene.links.map((link) => (
              <li key={link.url}>
                <Link href={link.url} target="_blank" rel="noopener noreferrer" className="text-base">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
        {scene.cta && <p className="text-sm font-medium uppercase tracking-wide text-primary">{scene.cta}</p>}
      </Stagger>
    </div>
  );
}
