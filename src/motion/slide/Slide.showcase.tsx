import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Slide } from ".";

function panel(label: string) {
  return <div className="rounded-ui bg-primary px-panel py-panel text-center text-sm text-primary-fg">{label}</div>;
}

const entry: ShowcaseEntry = {
  title: "Slide",
  group: "motion",
  description:
    "Real clipping parent plus a separately-translating inner element, so overflow:hidden actually clips.",
  demos: [
    {
      name: "mode=\"in\" — 4 directions",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="grid grid-cols-2 gap-panel">
            <Slide direction="left" duration="slow">{panel("left")}</Slide>
            <Slide direction="right" duration="slow">{panel("right")}</Slide>
            <Slide direction="up" duration="slow">{panel("up")}</Slide>
            <Slide direction="down" duration="slow">{panel("down")}</Slide>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "mode=\"out\"",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <Slide direction="up" mode="out" duration="slow" delay="normal">
            {panel("slides out and clips")}
          </Slide>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
