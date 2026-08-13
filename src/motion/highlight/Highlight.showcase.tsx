import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Highlight } from ".";

const entry: ShowcaseEntry = {
  title: "Highlight",
  group: "motion",
  description: "Five treatments over inline content, all token-coloured and progress-driven — the overlay always has an explicit rounded-ui-sm radius, never inherited, and sits a little proud of the glyph bounds (-inset-highlight) rather than hugging them.",
  demos: [
    {
      name: "modes",
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
      name: "overlay radius is its own, never the child's",
      description:
        "The box overlay always draws with rounded-ui-sm, deliberately NOT matching this pill's own fully-rounded corners — proof the radius is the overlay's own explicit token, not something inherited or measured from the child.",
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
