import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Highlight } from ".";

const entry: ShowcaseEntry = {
  title: "Highlight",
  group: "motion",
  description: "Five treatments over inline content, all token-coloured and progress-driven — the overlay always has an explicit rounded-ui-sm radius, never inherited.",
  demos: [
    {
      name: "modes",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="flex flex-wrap items-center gap-panel text-base text-fg">
            <Highlight mode="fill" duration="slow">fill</Highlight>
            <Highlight mode="box" color="success" duration="slow" delay="quick">box</Highlight>
            <Highlight mode="glow" color="warning" duration="slow" delay="normal">glow</Highlight>
            <Highlight mode="underline" color="danger" duration="slow" delay="normal">underline</Highlight>
            <Highlight mode="strike" duration="slow" delay="slow">strike</Highlight>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "over rounded content",
      description: "The overlay's own radius, not an inherited one — corners stay round.",
      render: () => (
        <MotionPreview durationInFrames={60}>
          <Highlight mode="fill" duration="slow">
            <span className="rounded-ui bg-surface px-panel py-compact-y">rounded chip content</span>
          </Highlight>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
