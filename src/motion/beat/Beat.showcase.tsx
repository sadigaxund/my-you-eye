import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Reveal } from "../reveal";
import { Beat } from ".";

const entry: ShowcaseEntry = {
  title: "Beat",
  group: "motion",
  description: "A no-op hold — renders children unchanged, so a pause between two reveals reads as intentional rather than a missing animation.",
  demos: [
    {
      name: "hold between reveals",
      render: () => (
        <MotionPreview durationInFrames={120}>
          <div className="flex flex-col gap-tight">
            <Reveal from="up" duration="normal">
              <div className="rounded-ui bg-secondary px-panel py-compact-y text-sm text-secondary-fg">step one</div>
            </Reveal>
            <Beat hold="slow">
              <div className="text-xs text-muted">(intentional pause here — hold=&quot;slow&quot;)</div>
            </Beat>
            <Reveal from="up" duration="normal" delay="slow">
              <div className="rounded-ui bg-primary px-panel py-compact-y text-sm text-primary-fg">step two</div>
            </Reveal>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
