import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Shake } from ".";

const entry: ShowcaseEntry = {
  title: "Shake",
  group: "motion",
  description:
    "Decaying-amplitude oscillation, deterministic via a seeded PRNG — never an unseeded random source.",
  demos: [
    {
      name: "Axis variants",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <div className="flex gap-panel">
            <Shake axis="x">
              <div className="rounded-ui bg-danger px-panel py-compact-y text-sm text-primary-fg">x</div>
            </Shake>
            <Shake axis="y">
              <div className="rounded-ui bg-danger px-panel py-compact-y text-sm text-primary-fg">y</div>
            </Shake>
            <Shake axis="rotate">
              <div className="rounded-ui bg-danger px-panel py-compact-y text-sm text-primary-fg">rotate</div>
            </Shake>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
