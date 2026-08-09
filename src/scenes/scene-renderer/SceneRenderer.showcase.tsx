import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { SceneRenderer } from ".";
import type { Scene } from "../schema";

const title: Scene = { kind: "title", chapter: "Part 1", title: "SceneRenderer dispatches on scene.kind" };
const bullets: Scene = { kind: "bullets", bullets: [{ text: "One switch, eleven kinds" }, { text: "Every kind renders for real" }] };
const diagram: Scene = {
  kind: "diagram",
  nodes: [{ id: "a", label: "A" }, { id: "b", label: "B" }],
  edges: [{ from: "a", to: "b", label: "calls" }],
  steps: [{ reveal: ["a", "b"], connect: ["a->b"] }],
};
const chart: Scene = { kind: "chart", chart: { type: "bar", categories: ["Mon", "Tue", "Wed"], series: [{ label: "s", data: [4, 7, 5] }] } };
const stat: Scene = { kind: "stat", stats: [{ label: "Uptime", value: 99.98, format: "percent" }] };

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "SceneRenderer",
  group: "scenes",
  description: "The single switch(scene.kind) consumers never touch. All eleven SceneKinds render for real — there is no placeholder branch.",
  demos: [
    {
      name: "title",
      render: () => (
        <MotionPreview durationInFrames={60}>
          <Frame><SceneRenderer scene={title} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "bullets",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <Frame><SceneRenderer scene={bullets} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "diagram + chart + stat",
      description: "Three of the harder kinds (diagram/chart/stat), dispatched through the exact same switch as title/bullets above — every scene folder under src/scenes/ is reachable from this one function.",
      render: () => (
        <div className="flex flex-col gap-4">
          <MotionPreview durationInFrames={90}><Frame><SceneRenderer scene={diagram} /></Frame></MotionPreview>
          <MotionPreview durationInFrames={90}><Frame><SceneRenderer scene={chart} /></Frame></MotionPreview>
          <MotionPreview durationInFrames={90}><Frame><SceneRenderer scene={stat} /></Frame></MotionPreview>
        </div>
      ),
    },
  ],
};
export default entry;
