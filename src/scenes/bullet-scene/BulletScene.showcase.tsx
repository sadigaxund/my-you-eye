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
  description: "Heading plus bullets, each revealed as its own step — a bullet's own SequenceRange (from useSequence) drives its Reveal, so longer narration gets proportionally more time before the next bullet lands.",
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
      description: "Bullets 1 and 2 (including bullet 2's three sub-points) are fully revealed and opaque; bullet 3 — the emphasis=\"strong\" dead-letter bullet — has just started its own Reveal (its step starts at frame 172) and is roughly half-faded/half-risen in.",
      render: () => (
        <PinnedFrame frame={179} durationInFrames={280}>
          <Frame><BulletScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned at rest (frame 280/280)",
      description: "All three bullets fully revealed; bullet 3's text sits under a solid primary-color underline (the emphasis=\"strong\" treatment).",
      render: () => (
        <PinnedFrame frame={280} durationInFrames={280}>
          <Frame><BulletScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
