import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { TextSwap } from ".";

const entry: ShowcaseEntry = {
  title: "TextSwap",
  group: "motion",
  description: "Cross-fade or roll between two strings without a layout jump, because a hidden sizer reserves the space.",
  demos: [
    {
      name: "Fade",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <TextSwap from="Draft" to="Published" mode="fade" duration="slow" className="text-lg text-fg" />
        </MotionPreview>
      ),
    },
    {
      name: "Roll",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <TextSwap from="42 views" to="1,204 views" mode="roll" duration="slow" className="font-mono text-lg text-fg" />
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
