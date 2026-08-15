import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Highlight } from ".";

const entry: ShowcaseEntry = {
  title: "Highlight",
  group: "motion",
  description: "Five token-coloured, progress-driven treatments over inline content.",
  demos: [
    {
      name: "Modes",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <div className="flex flex-wrap items-center justify-center gap-panel text-base text-fg">
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
      name: "Overlay radius",
      description:
        "The box overlay always draws rounded-ui-sm and does not inherit this pill's fully-rounded corners.",
      render: () => (
        <MotionPreview durationInFrames={60} center leadIn>
          <Highlight mode="box" color="primary" duration="slow">
            <span className="rounded-full bg-surface px-panel py-compact-y text-fg">rounded pill content</span>
          </Highlight>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
