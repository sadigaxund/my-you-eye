import { EmptyState } from "../../ui/empty-state";
import { Badge } from "../../ui/badge";
import { TitleScene } from "../title-scene";
import { BulletScene } from "../bullet-scene";
import { CodeScene } from "../code-scene";
import { TerminalScene } from "../terminal-scene";
import { OutroScene } from "../outro-scene";
import { DiagramScene } from "../diagram-scene";
import { SequenceScene } from "../sequence-scene";
import { ChartScene } from "../chart-scene";
import type { Scene } from "../schema";

export interface SceneRendererProps {
  scene: Scene;
}

/** Clearly-labelled placeholder for a scene kind the renderer doesn't yet
 * implement (diagram/sequence/chart/stat/compare/walkthrough — the next
 * batch, TODO.md Q5's second half). Never a silent blank frame: a bad or
 * not-yet-supported scene should always be obvious in a preview. */
function NotImplemented({ kind }: { kind: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-bg text-fg">
      <EmptyState
        icon={<Badge variant="warning">{kind}</Badge>}
        title={`"${kind}" scenes aren't implemented yet`}
        description="This scene kind is part of the frozen schema but SceneRenderer doesn't render it yet — a later batch adds it."
      />
    </div>
  );
}

/**
 * `Scene` -> rendered frame. The single switch consumers never touch
 * (TODO.md Phase E). Exhaustive over `SceneKind`: the `default` branch
 * assigns `scene` to a `never`-typed binding, so TypeScript itself flags a
 * missing `case` the moment the union grows — this is not a runtime check,
 * it's a compile-time guarantee that every kind is handled somehow, even if
 * only by `NotImplemented` for now.
 */
export function SceneRenderer({ scene }: SceneRendererProps) {
  switch (scene.kind) {
    case "title": return <TitleScene scene={scene} />;
    case "bullets": return <BulletScene scene={scene} />;
    case "code": return <CodeScene scene={scene} />;
    case "terminal": return <TerminalScene scene={scene} />;
    case "outro": return <OutroScene scene={scene} />;
    case "diagram": return <DiagramScene scene={scene} />;
    case "sequence": return <SequenceScene scene={scene} />;
    case "chart": return <ChartScene scene={scene} />;
    case "stat": return <NotImplemented kind="stat" />;
    case "compare": return <NotImplemented kind="compare" />;
    case "walkthrough": return <NotImplemented kind="walkthrough" />;
    default: {
      const exhaustive: never = scene;
      throw new Error(`SceneRenderer: unhandled scene kind ${(exhaustive as Scene).kind}`);
    }
  }
}
