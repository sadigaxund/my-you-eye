import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { TitleScene } from ".";
import type { TitleScene as TitleSceneData } from "../schema";

const centered: TitleSceneData = {
  kind: "title",
  chapter: "Part 3",
  title: "How the scheduler works",
  subtitle: "A tour of the retry loop, from enqueue to ack",
};

const left: TitleSceneData = {
  kind: "title",
  title: "Deploying to production",
  align: "left",
};

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "TitleScene",
  group: "scenes",
  description: "Opening/chapter card — chapter eyebrow, title and subtitle stagger in together, timed off the scene's own content-derived duration.",
  demos: [
    {
      name: "Centered, playing",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <Frame><TitleScene scene={centered} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "Left-aligned, no chapter/subtitle",
      render: () => (
        <MotionPreview durationInFrames={60}>
          <Frame><TitleScene scene={left} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "Pinned mid-stagger (frame 12/90)",
      description: "The chapter eyebrow has fully faded in; the title is mid-reveal; the subtitle hasn't started yet.",
      render: () => (
        <PinnedFrame frame={12} durationInFrames={90}>
          <Frame><TitleScene scene={centered} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned at rest (frame 90/90)",
      render: () => (
        <PinnedFrame frame={90} durationInFrames={90}>
          <Frame><TitleScene scene={centered} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
