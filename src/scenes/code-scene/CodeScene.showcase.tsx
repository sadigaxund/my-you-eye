import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { CodeScene } from ".";
import type { CodeScene as CodeSceneData } from "../schema";

const initialCode = `function total(items) {
  let sum = 0;
  for (const item of items) {
    sum += item.price;
  }
  return sum;
}`;

const finalCode = `function total(items, taxRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate);
}`;

const scene: CodeSceneData = {
  kind: "code",
  file: "totals.js",
  lang: "js",
  code: initialCode,
  steps: [
    { say: "Here's our starting point.", typed: true },
    { say: "The loop accumulates the sum.", focus: [2, 5], highlight: ["sum"] },
    { say: "We rewrite it as a single reduce call with tax support.", code: finalCode, focus: [1, 3] },
  ],
};

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "CodeScene",
  group: "scenes",
  description: "CodeBlock with the filename tab, per-step focus dimming + Camera framing, highlight substrings, typed character reveal, and a CodeDiff cross-fade for any step that supplies new code.",
  demos: [
    {
      name: "Playing",
      render: () => (
        <MotionPreview durationInFrames={170} fps={30}>
          <Frame><CodeScene scene={scene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "Pinned mid-typing, step 1 (frame 15/149)",
      description: "The file types in character by character — roughly the first third of the source is visible, syntax-highlighted as it grows.",
      render: () => (
        <PinnedFrame frame={15} durationInFrames={149}>
          <Frame><CodeScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned on focus + highlight, step 2 (frame 55/149)",
      description: "Lines 2–5 (the sum accumulator) are at full contrast; the rest of the file is dimmed via opacity-muted. Every \"sum\" substring inside that range is highlighted. Camera has zoomed/panned to frame lines 2–5.",
      render: () => (
        <PinnedFrame frame={55} durationInFrames={149}>
          <Frame><CodeScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned mid-diff, step 3 (frame 105/149)",
      description: "CodeDiff is cross-fading the old loop body into the new reduce() call — some rows are still fading/growing/collapsing, not yet settled.",
      render: () => (
        <PinnedFrame frame={105} durationInFrames={149}>
          <Frame><CodeScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned at rest (frame 149/149)",
      description: "The final rewritten source, fully settled, with lines 1–3 framed by the camera.",
      render: () => (
        <PinnedFrame frame={149} durationInFrames={149}>
          <Frame><CodeScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
