import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Unmask } from ".";

const entry: ShowcaseEntry = {
  title: "Unmask",
  group: "motion",
  description: "Soft-edged mask sweep, a gentler alternative to Wipe's hard clip-path edge for headings and pull-quotes.",
  demos: [
    {
      name: "Directions & softness",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="flex flex-col gap-panel">
            <Unmask direction="left" duration="slow">
              <h3 className="text-2xl font-semibold text-fg">Unmasked heading</h3>
            </Unmask>
            <Unmask direction="up" softness={0.5} duration="slow" delay="quick">
              <p className="text-base text-fg">A softer, wider leading edge on the sweep.</p>
            </Unmask>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
