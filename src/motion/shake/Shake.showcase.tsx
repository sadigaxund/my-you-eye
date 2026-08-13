import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Shake } from ".";

const entry: ShowcaseEntry = {
  title: "Shake",
  group: "motion",
  description:
    "Decaying-amplitude oscillation, deterministic via a seeded PRNG (core/prng.ts) — never an unseeded random source. Defaults to duration=\"slow\" with an eased phase, so cycles bunch up and settle rather than ticking at one constant frequency.",
  demos: [
    {
      name: "axis variants",
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
