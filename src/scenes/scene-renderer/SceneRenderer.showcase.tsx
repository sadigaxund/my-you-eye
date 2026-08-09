import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { SceneRenderer } from ".";
import type { Scene } from "../schema";

const title: Scene = { kind: "title", chapter: "Part 1", title: "SceneRenderer dispatches on scene.kind" };
const bullets: Scene = { kind: "bullets", bullets: [{ text: "One switch, eleven kinds" }, { text: "Five render for real; six are placeholders" }] };
const diagram: Scene = { kind: "diagram", nodes: [{ id: "a", label: "A" }], edges: [], steps: [] };
const chart: Scene = { kind: "chart", chart: { type: "bar", categories: ["x"], series: [{ label: "s", data: [1] }] } };

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "SceneRenderer",
  group: "scenes",
  description: "The single switch(scene.kind) consumers never touch. Five kinds render for real (title/bullets/code/terminal/outro); the other six (diagram/sequence/chart/stat/compare/walkthrough) render a clearly-labelled placeholder until a later batch implements them — never a silent blank frame.",
  demos: [
    {
      name: "Implemented kind — title",
      render: () => (
        <MotionPreview durationInFrames={60}>
          <Frame><SceneRenderer scene={title} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "Implemented kind — bullets",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <Frame><SceneRenderer scene={bullets} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "Not-yet-implemented kinds — placeholder",
      description: "diagram and chart both go through SceneRenderer's default-branch placeholder — labelled with the scene's own kind, never blank.",
      render: () => (
        <div className="flex flex-col gap-4">
          <Frame><SceneRenderer scene={diagram} /></Frame>
          <Frame><SceneRenderer scene={chart} /></Frame>
        </div>
      ),
    },
  ],
};
export default entry;
