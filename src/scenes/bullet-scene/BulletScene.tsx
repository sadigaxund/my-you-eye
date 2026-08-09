import { Reveal, Highlight } from "../../motion";
import { useSequence } from "../../motion/core";
import type { SequenceRange } from "../../motion/core";
import { StatusDot } from "../../ui/status-dot";
import { sceneSteps, stepName } from "../timing";
import type { BulletScene as BulletSceneData, BulletItem } from "../schema";

export interface BulletSceneProps {
  scene: BulletSceneData;
}

function BulletRow({ bullet, range }: { bullet: BulletItem; range: SequenceRange }) {
  const isStrong = bullet.emphasis === "strong";
  const text = <span className="text-lg text-fg">{bullet.text}</span>;

  return (
    <li>
      <Reveal from="up" delay={range.startFrame} duration="normal">
        <div className="flex items-start gap-inline">
          <StatusDot size="sm" variant={isStrong ? "info" : "neutral"} className="mt-2" />
          <div className="flex flex-col gap-tight">
            {isStrong ? (
              <Highlight mode="underline" color="primary" delay={range.startFrame} duration="slow">
                {text}
              </Highlight>
            ) : (
              text
            )}
            {bullet.children && bullet.children.length > 0 && (
              <ul className="flex flex-col gap-tight pl-panel">
                {bullet.children.map((child, i) => (
                  <li key={i} className="text-sm text-muted">{child}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Reveal>
    </li>
  );
}

/**
 * Heading plus bullets, revealed one per step (TODO.md Phase E). Bullets
 * *are* the steps — each one's `Reveal` is anchored to its own
 * `SequenceRange.startFrame` from `useSequence(sceneSteps(scene), ...)`, so
 * a bullet with a longer `say` line gets proportionally more time on screen
 * before the next one lands, exactly as `sceneDuration` accounts for when it
 * paces the whole scene. `children` sub-points land together with their
 * parent (one `Reveal`, not a nested stagger) — `steps.ts`'s
 * `BulletItem.children` doc is explicit that they're not separately timed.
 */
export function BulletScene({ scene }: BulletSceneProps) {
  const ranges = useSequence(sceneSteps(scene), scene.pace);

  return (
    <div className="flex h-full w-full flex-col justify-center gap-stack bg-bg px-panel-xl text-fg">
      {scene.heading && <h2 className="text-2xl font-semibold text-fg">{scene.heading}</h2>}
      <ul className="flex flex-col gap-stack">
        {scene.bullets.map((bullet, i) => (
          <BulletRow key={bullet.id ?? i} bullet={bullet} range={ranges[stepName(bullet.id, i)]} />
        ))}
      </ul>
    </div>
  );
}
