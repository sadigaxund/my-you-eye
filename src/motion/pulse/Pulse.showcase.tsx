import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Pulse } from ".";

const entry: ShowcaseEntry = {
  title: "Pulse",
  group: "motion",
  description:
    "Looping scale/opacity breathing, driven by frame % period — never CSS animation.",
  demos: [
    {
      name: "Infinite",
      render: () => (
        <MotionPreview durationInFrames={120} center leadIn>
          <Pulse duration="normal">
            <div className="size-16 rounded-ui bg-primary" />
          </Pulse>
        </MotionPreview>
      ),
    },
    {
      name: "Loop=3, then settles",
      render: () => (
        <MotionPreview durationInFrames={120} center leadIn>
          <Pulse duration="quick" loop={3}>
            <div className="rounded-ui bg-success px-panel py-compact-y text-sm text-success-fg">settles after 3 breaths</div>
          </Pulse>
        </MotionPreview>
      ),
    },
    {
      name: "Pulse a non-text sibling",
      description: "Wrapping only the dot keeps the label's glyphs out of the compositor transform entirely.",
      render: () => (
        <MotionPreview durationInFrames={120} center leadIn>
          <div className="flex items-center gap-inline">
            <Pulse duration="normal" as="span">
              <span className="block size-2.5 rounded-full bg-danger" />
            </Pulse>
            <span className="text-sm text-fg">3 alerts need attention</span>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
