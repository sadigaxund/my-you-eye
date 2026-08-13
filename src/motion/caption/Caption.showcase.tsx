import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Caption } from ".";

const entry: ShowcaseEntry = {
  title: "Caption",
  group: "motion",
  description: "Timed lower-third text tied to a step's Timing range. Requires a position: relative ancestor.",
  demos: [
    {
      name: "positions",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="relative h-32 rounded-ui bg-secondary">
            <Caption text="The scheduler's retry loop" subtitle="scheduler.ts:22" position="bottom-left" duration="slow" />
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "bottom-center",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="relative h-32 rounded-ui bg-secondary">
            <Caption text="Part 3 — How it scales" position="bottom-center" duration="slow" />
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
