import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { buildSequence } from "../../motion/core";
import { CodeScene } from ".";
import { sceneSteps, sceneDuration } from "../timing";
import type { CodeScene as CodeSceneData } from "../schema";

const FPS = 30;

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
    {
      say: "The new tax rate parameter defaults to zero.",
      focus: [1, 1],
      annotate: [{ line: 1, text: "Optional param, defaults to 0", side: "right" }],
    },
  ],
};

const ranges = buildSequence(sceneSteps(scene), FPS, scene.pace);
const total = sceneDuration(scene, FPS);
const step0 = ranges["step-0"];
const step1 = ranges["step-1"];
const step2 = ranges["step-2"];
const step3 = ranges["step-3"];

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "CodeScene",
  group: "scenes",
  description: "CodeBlock with per-step focus dimming, Camera framing, highlights, typing and diff cross-fades.",
  demos: [
    {
      name: "Playing",
      description: "The whole four-step scene (type in, focus, rewrite, annotate), which every frame below is taken from.",
      render: () => (
        <MotionPreview durationInFrames={total} fps={FPS}>
          <Frame><CodeScene scene={scene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: `Pinned mid-typing, step 1 (frame ${step0.startFrame + 15}/${total})`,
      description: "The file types in character by character, syntax-highlighted as it grows.",
      render: () => (
        <PinnedFrame frame={step0.startFrame + 15} durationInFrames={total}>
          <Frame><CodeScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned on focus + highlight, step 2 (frame ${step1.startFrame + 5}/${total})`,
      description: "Lines 2 to 5 stay at full contrast with every \"sum\" highlighted, and the camera has framed them.",
      render: () => (
        <PinnedFrame frame={step1.startFrame + 5} durationInFrames={total}>
          <Frame><CodeScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned mid-diff, step 3 (frame ${step2.startFrame + 5}/${total})`,
      description: "CodeDiff is cross-fading the old loop body into the new reduce() call and has not settled yet.",
      render: () => (
        <PinnedFrame frame={step2.startFrame + 5} durationInFrames={total}>
          <Frame><CodeScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned at rest, end of step 3 (frame ${step2.endFrame - 1}/${total})`,
      description: "The rewritten source, fully settled, with lines 1 to 3 framed by the camera.",
      render: () => (
        <PinnedFrame frame={step2.endFrame - 1} durationInFrames={total}>
          <Frame><CodeScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned with an Annotation callout, step 4 (frame ${step3.endFrame - 1}/${total})`,
      description: "A leader line points at line 1, mounted inside Camera's layer so it stays attached.",
      render: () => (
        <PinnedFrame frame={step3.endFrame - 1} durationInFrames={total}>
          <Frame><CodeScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
