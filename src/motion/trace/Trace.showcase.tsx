import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Draw } from "../draw";
import { Trace } from ".";

const PATH = "M5,50 C 30,10 70,90 95,50";

const entry: ShowcaseEntry = {
  title: "Trace",
  group: "motion",
  description: "Tokens travelling along an SVG path — the data-flow primitive for architecture diagrams. Overlaid here on a static Draw path for visual reference.",
  demos: [
    {
      name: "single token, looping",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="relative h-24 w-64">
            <Draw d={PATH} viewBox="0 0 100 60" color="muted" className="absolute inset-0" duration="instant" />
            <Trace d={PATH} viewBox="0 0 100 60" duration="slow" className="absolute inset-0" />
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "multiple tokens, spaced",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="relative h-24 w-64">
            <Draw d={PATH} viewBox="0 0 100 60" color="muted" className="absolute inset-0" duration="instant" />
            <Trace d={PATH} viewBox="0 0 100 60" count={3} spacing={0.2} color="success" shape="square" duration="normal" className="absolute inset-0" />
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
