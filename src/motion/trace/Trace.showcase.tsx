import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Draw } from "../draw";
import { Trace } from ".";

// A wider viewBox (was 100x60, now 160x60) plus a container sized to match
// its own aspect ratio via inline style — not a Tailwind arbitrary class,
// this ratio is structurally tied to the viewBox right above it, not a
// design constant. Owner feedback: the previous fixed h-24 w-64 (96x256px)
// box clipped most of the path, leaving only a small visible portion.
const PATH = "M8,50 C 50,10 110,90 152,50";
const VIEW_BOX = "0 0 160 60";

const entry: ShowcaseEntry = {
  title: "Trace",
  group: "motion",
  description: "Tokens travelling along an SVG path — the data-flow primitive for architecture diagrams. Overlaid here on a static Draw path for visual reference.",
  demos: [
    {
      name: "single token, looping",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="relative w-full" style={{ aspectRatio: "8 / 3" }}>
            <Draw d={PATH} viewBox={VIEW_BOX} color="muted" strokeWidth="md" className="absolute inset-0 size-full" duration="instant" />
            <Trace d={PATH} viewBox={VIEW_BOX} size={5} duration="slow" className="absolute inset-0 size-full" />
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "multiple tokens, spaced",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="relative w-full" style={{ aspectRatio: "8 / 3" }}>
            <Draw d={PATH} viewBox={VIEW_BOX} color="muted" strokeWidth="md" className="absolute inset-0 size-full" duration="instant" />
            <Trace d={PATH} viewBox={VIEW_BOX} count={3} spacing={0.2} size={5} color="success" shape="square" duration="normal" className="absolute inset-0 size-full" />
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
