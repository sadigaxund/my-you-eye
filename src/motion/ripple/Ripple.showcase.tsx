import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Ripple } from ".";

const entry: ShowcaseEntry = {
  title: "Ripple",
  group: "motion",
  description: "Click feedback at a point: an expanding ring, filled disc, or double pulse.",
  demos: [
    {
      name: "Click — ring",
      description: "The default: a single outline expands and fades.",
      render: () => (
        <MotionPreview durationInFrames={60} loop leadIn>
          <div className="relative h-24 w-full overflow-hidden rounded-ui bg-surface">
            <Ripple x={80} y={48} duration="normal" />
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "Click — solid vs double",
      description: "solid is a filled disc; double adds a second, phase-delayed ring.",
      render: () => (
        <MotionPreview durationInFrames={60} loop leadIn>
          <div className="relative flex h-24 w-full gap-panel overflow-hidden rounded-ui bg-surface p-panel">
            <Ripple x={30} y={30} variant="solid" color="success" duration="normal" />
            <Ripple x={110} y={30} variant="double" color="primary" duration="normal" delay="quick" />
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
