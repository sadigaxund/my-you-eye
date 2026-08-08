import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Ripple } from ".";

const entry: ShowcaseEntry = {
  title: "Ripple",
  group: "motion",
  description: "An expanding, fading ring at a point — marks clicks and events. Used by Cursor for its click effect.",
  demos: [
    {
      name: "single ripple",
      render: () => (
        <MotionPreview durationInFrames={60} loop>
          <div className="relative h-24 w-full overflow-hidden rounded-ui bg-surface">
            <Ripple x={80} y={48} duration="normal" />
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "colors",
      render: () => (
        <MotionPreview durationInFrames={60} loop>
          <div className="relative flex h-24 w-full gap-panel overflow-hidden rounded-ui bg-surface p-panel">
            <Ripple x={30} y={30} color="success" duration="normal" />
            <Ripple x={110} y={30} color="danger" duration="normal" delay="quick" />
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
