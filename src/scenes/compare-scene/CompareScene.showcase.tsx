import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { placeholderScreenshot } from "../../showcase/placeholderScreenshot";
import { buildSequence } from "../../motion/core";
import { CompareScene } from ".";
import { sceneSteps, sceneDuration } from "../timing";
import type { CompareScene as CompareSceneData } from "../schema";

const FPS = 30;

const codeScene: CompareSceneData = {
  kind: "compare",
  mode: "columns",
  heading: "Before / after",
  say: "The reduce call replaces the manual loop.",
  before: { content: "code", label: "Before", lang: "js", code: "let sum = 0;\nfor (const x of items) {\n  sum += x.price;\n}" },
  after: { content: "code", label: "After", lang: "js", code: "const sum = items.reduce(\n  (s, x) => s + x.price,\n  0,\n);" },
};

const wipeScene: CompareSceneData = {
  kind: "compare",
  mode: "wipe",
  heading: "Redesigned dashboard",
  say: "The new layout consolidates the three cards into one panel.",
  before: { content: "image", label: "Before", src: placeholderScreenshot() },
  after: { content: "image", label: "After", src: placeholderScreenshot() },
};

const codeRanges = buildSequence(sceneSteps(codeScene), FPS, codeScene.pace);
const codeTotal = sceneDuration(codeScene, FPS);
const wipeTotal = sceneDuration(wipeScene, FPS);
const codeRange = Object.values(codeRanges)[0];

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "CompareScene",
  group: "scenes",
  description: "Wraps Comparison. mode \"columns\" (default) sets two panes side by side with `after` fading in; mode \"wipe\" overlays them under a divider driven entirely by the scene's own beat progress. Panes are the ComparePane union — code, text, or image.",
  demos: [
    {
      name: "Columns (code panes) — playing",
      render: () => (
        <MotionPreview durationInFrames={codeTotal} fps={FPS}>
          <Frame><CompareScene scene={codeScene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: `Pinned mid-reveal, columns (frame ${Math.round((codeRange.startFrame + codeRange.endFrame) / 2)}/${codeTotal})`,
      description: "The before pane is fully visible; the after pane is partway through its Reveal fade-in.",
      render: () => (
        <PinnedFrame frame={Math.round((codeRange.startFrame + codeRange.endFrame) / 2)} durationInFrames={codeTotal}>
          <Frame><CompareScene scene={codeScene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Wipe (image panes) — playing",
      render: () => (
        <MotionPreview durationInFrames={wipeTotal} fps={FPS}>
          <Frame><CompareScene scene={wipeScene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: `Pinned mid-wipe (frame ${Math.round(wipeTotal * 0.4)}/${wipeTotal})`,
      description: "The wipe divider sits partway across the frame, driven by the scene's own beat progress — no drag handle (a video/live frame is not an interactive control surface).",
      render: () => (
        <PinnedFrame frame={Math.round(wipeTotal * 0.4)} durationInFrames={wipeTotal}>
          <Frame><CompareScene scene={wipeScene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
