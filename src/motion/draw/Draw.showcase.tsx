import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Draw } from ".";

const entry: ShowcaseEntry = {
  title: "Draw",
  group: "motion",
  description:
    "stroke-dashoffset reveal on any SVG path, normalised via pathLength so it's resolution-independent. Pairs with ConnectionLine/ConnectionLayer for animating diagram edges.",
  demos: [
    {
      name: "basic path",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <Draw d="M10,50 C 30,10 70,10 90,50" viewBox="0 0 100 60" duration="slow" className="h-24 w-64" />
        </MotionPreview>
      ),
    },
    {
      name: "colors + stroke widths",
      render: () => (
        <MotionPreview durationInFrames={90} center leadIn>
          <div className="flex gap-panel">
            <Draw d="M5,25 L45,25" viewBox="0 0 50 50" color="success" strokeWidth="sm" duration="slow" className="h-12 w-16" />
            <Draw d="M5,25 L45,25" viewBox="0 0 50 50" color="warning" strokeWidth="md" duration="slow" delay="quick" className="h-12 w-16" />
            <Draw d="M5,25 L45,25" viewBox="0 0 50 50" color="danger" strokeWidth="lg" duration="slow" delay="normal" className="h-12 w-16" />
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
