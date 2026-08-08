import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Morph } from ".";

const entry: ShowcaseEntry = {
  title: "Morph",
  group: "motion",
  description: "Interpolates between two caller-supplied snapshots (position/size/opacity) — a simplified FLIP, not a DOM-measuring engine.",
  demos: [
    {
      name: "reposition + resize",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="relative h-32 w-full">
            <Morph from={{ x: 0, y: 0, width: 80, height: 40, opacity: 1 }} to={{ x: 200, y: 60, width: 140, height: 56, opacity: 1 }} duration="slow">
              <div className="flex size-full items-center justify-center rounded-ui bg-primary text-sm text-primary-fg">morphing</div>
            </Morph>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
