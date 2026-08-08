import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Stagger } from ".";

function chip(label: string) {
  return (
    <div key={label} className="rounded-ui bg-secondary px-panel py-compact-y text-sm text-secondary-fg">
      {label}
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Stagger",
  group: "motion",
  description: "Orchestrates a per-child Reveal with offset timing — first-to-last, last-to-first, or outward from the center.",
  demos: [
    {
      name: "from=\"first\"",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="flex gap-inline">
            <Stagger each="quick" from="first">
              {["one", "two", "three", "four", "five"].map(chip)}
            </Stagger>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "from=\"center\"",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="flex gap-inline">
            <Stagger each="quick" from="center" revealFrom="scale">
              {["one", "two", "three", "four", "five"].map(chip)}
            </Stagger>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
