import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { BulletScene } from ".";
import type { BulletScene as BulletSceneData } from "../schema";

const scene: BulletSceneData = {
  kind: "bullets",
  heading: "Why the retry loop matters",
  bullets: [
    { text: "Every message is acked exactly once", say: "Every message is acked exactly once, even across a crash." },
    {
      text: "Backoff is exponential with jitter",
      say: "Backoff is exponential with jitter, so a thundering herd never forms.",
      children: ["Base delay: 200ms", "Max delay: 30s", "Jitter: full"],
    },
    { text: "Dead-letter after 5 attempts", emphasis: "strong", say: "Dead-letter after 5 attempts — that's the one number to remember." },
  ],
};

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "BulletScene",
  group: "scenes",
  description: "Heading plus bullets, each revealed as its own step and paced by its own narration length.",
  demos: [
    {
      name: "Playing",
      render: () => (
        <MotionPreview durationInFrames={280}>
          <Frame><BulletScene scene={scene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "Pinned mid-sequence (frame 179/280)",
      description: "Bullets 1 and 2 are settled; the emphasis=\"strong\" bullet 3 is halfway through its own Reveal.",
      render: () => (
        <PinnedFrame frame={179} durationInFrames={280}>
          <Frame><BulletScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned at rest (frame 280/280)",
      description: "All three bullets revealed; bullet 3 sits under the emphasis=\"strong\" underline.",
      render: () => (
        <PinnedFrame frame={280} durationInFrames={280}>
          <Frame><BulletScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
