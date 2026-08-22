import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Reveal } from "../reveal";
import { Beat } from ".";

const entry: ShowcaseEntry = {
  title: "Beat",
  group: "motion",
  description: "A no-op hold, so a deliberate pause reads as intentional instead of as a missing animation.",
  demos: [
    {
      name: "Hold between reveals",
      description: 'The gap here is a deliberate Beat, hold="slow" — not a missing animation.',
      render: () => (
        <MotionPreview durationInFrames={120} center leadIn>
          <div className="flex flex-col items-center gap-tight">
            <Reveal from="up" duration="normal">
              <div className="rounded-ui bg-secondary px-panel py-compact-y text-sm text-secondary-fg">step one</div>
            </Reveal>
            <Beat hold="slow">
              <span className="rounded-ui-sm bg-surface-opaque px-tight py-compact-y text-xs font-medium uppercase tracking-wide text-muted">
                hold
              </span>
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
