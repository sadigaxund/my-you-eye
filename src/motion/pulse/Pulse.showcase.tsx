import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Pulse } from ".";

const entry: ShowcaseEntry = {
  title: "Pulse",
  group: "motion",
  description: "Looping scale/opacity breathing, driven by frame % period — never CSS animation.",
  demos: [
    {
      name: "infinite",
      render: () => (
        <MotionPreview durationInFrames={120}>
          <Pulse duration="normal">
            <div className="size-16 rounded-ui bg-primary" />
          </Pulse>
        </MotionPreview>
      ),
    },
    {
      name: "loop=3, then settles",
      render: () => (
        <MotionPreview durationInFrames={120}>
          <Pulse duration="quick" loop={3}>
            <div className="rounded-ui bg-success px-panel py-compact-y text-sm text-success-fg">settles after 3 breaths</div>
          </Pulse>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
