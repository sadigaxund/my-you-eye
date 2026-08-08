import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Shake } from ".";

const entry: ShowcaseEntry = {
  title: "Shake",
  group: "motion",
  description: "Decaying-amplitude oscillation, deterministic via a seeded PRNG (core/prng.ts) — never an unseeded random source.",
  demos: [
    {
      name: "axis variants",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="flex gap-panel">
            <Shake axis="x" duration="slow">
              <div className="rounded-ui bg-danger px-panel py-compact-y text-sm text-primary-fg">x</div>
            </Shake>
            <Shake axis="y" duration="slow">
              <div className="rounded-ui bg-danger px-panel py-compact-y text-sm text-primary-fg">y</div>
            </Shake>
            <Shake axis="rotate" duration="slow">
              <div className="rounded-ui bg-danger px-panel py-compact-y text-sm text-primary-fg">rotate</div>
            </Shake>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
