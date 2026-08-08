import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { TextSwap } from ".";

const entry: ShowcaseEntry = {
  title: "TextSwap",
  group: "motion",
  description: "Cross-fade or roll between two strings without a layout jump — a hidden sizer reserves space for the longer string.",
  demos: [
    {
      name: "fade",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <TextSwap from="Draft" to="Published" mode="fade" duration="slow" className="text-lg text-fg" />
        </MotionPreview>
      ),
    },
    {
      name: "roll",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <TextSwap from="42 views" to="1,204 views" mode="roll" duration="slow" className="font-mono text-lg text-fg" />
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
