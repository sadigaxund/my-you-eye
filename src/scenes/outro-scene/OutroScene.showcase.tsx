import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { OutroScene } from ".";
import type { OutroScene as OutroSceneData } from "../schema";

const scene: OutroSceneData = {
  kind: "outro",
  title: "Thanks for watching",
  subtitle: "Part 4 covers the dead-letter queue",
  links: [
    { label: "GitHub", url: "https://github.com/example/repo" },
    { label: "Docs", url: "https://example.com/docs" },
    { label: "Discord", url: "https://discord.gg/example" },
  ],
  cta: "Subscribe for part 4",
};

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "OutroScene",
  group: "scenes",
  description: "End card — title, subtitle, a link list (via the Link primitive) and a closing call to action, staggering in as one beat.",
  demos: [
    {
      name: "Playing",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <Frame><OutroScene scene={scene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "Pinned mid-stagger (frame 10/90)",
      description: "Title has faded in; subtitle, links and CTA haven't started yet.",
      render: () => (
        <PinnedFrame frame={10} durationInFrames={90}>
          <Frame><OutroScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned at rest (frame 90/90)",
      description: "Title, subtitle, all three links and the CTA are fully visible.",
      render: () => (
        <PinnedFrame frame={90} durationInFrames={90}>
          <Frame><OutroScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
