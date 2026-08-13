import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Reveal } from ".";

const entry: ShowcaseEntry = {
  title: "Reveal",
  group: "motion",
  description:
    "Generic entrance animation — fade, directional slide, scale or blur — driven entirely by useProgress(). Wraps any single child without injecting a layout box when asChild is set. Stagger builds directly on top of this: it's just Reveal run once per child with offset delays — see Reveal vs Stagger on Stagger's own page.",
  demos: [
    {
      name: "from variants",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <div className="flex flex-wrap items-center justify-center gap-panel">
            <Reveal from="fade" duration="slow">
              <div className="rounded-ui bg-secondary px-panel py-compact-y text-sm text-secondary-fg">fade</div>
            </Reveal>
            <Reveal from="up" duration="slow" delay="quick">
              <div className="rounded-ui bg-secondary px-panel py-compact-y text-sm text-secondary-fg">up</div>
            </Reveal>
            <Reveal from="down" duration="slow" delay="quick">
              <div className="rounded-ui bg-secondary px-panel py-compact-y text-sm text-secondary-fg">down</div>
            </Reveal>
            <Reveal from="left" duration="slow" delay="normal">
              <div className="rounded-ui bg-secondary px-panel py-compact-y text-sm text-secondary-fg">left</div>
            </Reveal>
            <Reveal from="right" duration="slow" delay="normal">
              <div className="rounded-ui bg-secondary px-panel py-compact-y text-sm text-secondary-fg">right</div>
            </Reveal>
            <Reveal from="scale" duration="slow" delay="slow" spring="bouncy">
              <div className="rounded-ui bg-primary px-panel py-compact-y text-sm text-primary-fg">scale + bouncy</div>
            </Reveal>
            <Reveal from="blur" duration="slow" delay="slow">
              <div className="rounded-ui bg-secondary px-panel py-compact-y text-sm text-secondary-fg">blur</div>
            </Reveal>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "asChild (no layout box)",
      description: "asChild merges the animation onto the flex item itself instead of wrapping it in a new <div>.",
      render: () => (
        <MotionPreview durationInFrames={60} leadIn>
          <div className="flex items-center gap-inline">
            <span className="text-sm text-muted">flex row —</span>
            <Reveal asChild from="up">
              <span className="rounded-ui bg-primary px-panel py-compact-y text-sm text-primary-fg">asChild item</span>
            </Reveal>
            <span className="text-sm text-muted">— stays inline</span>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
