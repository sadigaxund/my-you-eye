import type { ReactNode } from "react";
import { Comparison } from "../../ui/patterns/comparison";
import { CodeBlock } from "../../ui/code-block";
import { Image } from "../../ui/image";
import { useProgress, useSequence } from "../../motion/core";
import { sceneSteps } from "../timing";
import type { CompareScene as CompareSceneData, ComparePane } from "../schema";

export interface CompareSceneProps {
  scene: CompareSceneData;
}

function renderPane(pane: ComparePane): ReactNode {
  switch (pane.content) {
    case "code":
      return <CodeBlock code={pane.code} language={pane.lang} header={pane.label} className="h-full" />;
    case "text":
      return <div className="whitespace-pre-wrap p-panel text-sm text-fg">{pane.text}</div>;
    case "image":
      return <Image src={pane.src} alt={pane.alt ?? pane.label} fit="contain" className="h-full w-full" />;
    default: {
      const exhaustive: never = pane;
      throw new Error(`CompareScene: unhandled pane content ${(exhaustive as ComparePane).content}`);
    }
  }
}

/**
 * Wraps `Comparison` (TODO.md Phase E). `mode: "columns"` (the schema's
 * default) maps onto `Comparison`'s `"side-by-side"`; `"wipe"` maps onto
 * `Comparison`'s own `mode="wipe"` with its divider driven entirely by
 * `progress` — never re-implemented, and never draggable in a scene (a
 * video/live-presenter frame is not an interactive control surface).
 *
 * `CompareScene` is a single beat (`timing.ts`'s `compareSteps` returns one
 * step named "compare", paced off `say`/`heading`/both labels) — `after`'s
 * reveal is that beat's entire content: in `"wipe"` mode the divider sweep
 * from 0 to 100 over the beat *is* the reveal; in `"columns"` mode `after`
 * fades in over the same beat while `before` is already on screen, so the
 * comparison still reads as "here's what changed" rather than both panes
 * simply appearing at once. That reveal is `Comparison`'s own `progress`
 * prop, which in side-by-side mode CLIPS the after column in from the left
 * — never an opacity animation. A partially-faded pane loses its 1px header
 * separator long before the pane itself looks faded, which is what read as a
 * glitching separator; a clip only ever draws pixels at full strength. See
 * Comparison's own comment at the render site.
 */
export function CompareScene({ scene }: CompareSceneProps) {
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const range = Object.values(ranges)[0];
  const duration = Math.max(1, range.endFrame - range.startFrame);
  const progress = useProgress({ delay: range.startFrame, duration });

  const mode = scene.mode ?? "columns";
  const beforeNode = renderPane(scene.before);
  const afterNode = renderPane(scene.after);

  return (
    <div className="flex h-full w-full flex-col justify-center gap-stack bg-bg p-panel-xl text-fg">
      {scene.heading && <h2 className="text-center text-2xl font-semibold text-fg">{scene.heading}</h2>}
      <Comparison
        mode={mode === "wipe" ? "wipe" : "side-by-side"}
        before={beforeNode}
        after={afterNode}
        beforeLabel={scene.before.label}
        afterLabel={scene.after.label}
        progress={progress}
        className="w-full"
      />
    </div>
  );
}
