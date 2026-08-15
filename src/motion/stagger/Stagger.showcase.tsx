import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Reveal } from "../reveal";
import { Stagger } from ".";

function chip(label: string) {
  return (
    <div key={label} className="rounded-ui bg-secondary px-panel py-compact-y text-sm text-secondary-fg">
      {label}
    </div>
  );
}

const CHIPS = ["one", "two", "three", "four", "five"];

const entry: ShowcaseEntry = {
  title: "Stagger",
  group: "motion",
  description:
    "Orchestrates a per-child Reveal with offset timing: first-to-last, last-to-first, or from the center.",
  demos: [
    {
      name: "Reveal vs Stagger",
      description: "Same 5 chips, same Reveal underneath — Stagger just gives each child its own delay.",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="flex flex-col gap-panel">
            <div className="flex flex-col gap-tight">
              <span className="text-xs text-muted">Reveal — all children share one Timing, so they move together</span>
              <div className="flex gap-inline">
                <Reveal from="up" duration="normal">
                  <div className="flex gap-inline">{CHIPS.map(chip)}</div>
                </Reveal>
              </div>
            </div>
            <div className="flex flex-col gap-tight">
              <span className="text-xs text-muted">Stagger each=&quot;quick&quot; — each child gets its own delay, offset by each</span>
              <div className="flex gap-inline">
                <Stagger each="quick" from="first">
                  {CHIPS.map(chip)}
                </Stagger>
              </div>
            </div>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "from=\"first\"",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <div className="flex gap-inline">
            <Stagger each="quick" from="first">
              {CHIPS.map(chip)}
            </Stagger>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "from=\"center\"",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <div className="flex gap-inline">
            <Stagger each="quick" from="center" revealFrom="scale">
              {CHIPS.map(chip)}
            </Stagger>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
