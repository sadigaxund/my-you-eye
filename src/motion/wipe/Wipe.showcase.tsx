import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Wipe } from ".";

function panel(label: string) {
  return <div className="flex h-20 items-center justify-center rounded-ui bg-primary text-sm text-primary-fg">{label}</div>;
}

const entry: ShowcaseEntry = {
  title: "Wipe",
  group: "motion",
  description: "clip-path reveal — linear (hard edge, 4 directions) or radial (circle growing from the direction's edge).",
  demos: [
    {
      name: "linear — 4 directions",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="grid grid-cols-2 gap-panel">
            <Wipe direction="left" duration="slow">{panel("left")}</Wipe>
            <Wipe direction="right" duration="slow">{panel("right")}</Wipe>
            <Wipe direction="up" duration="slow">{panel("up")}</Wipe>
            <Wipe direction="down" duration="slow">{panel("down")}</Wipe>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "radial",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <Wipe variant="radial" direction="left" duration="slow">{panel("radial from left")}</Wipe>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
