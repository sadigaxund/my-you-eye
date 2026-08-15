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
  heading: "Redesigned settings page",
  say: "The new layout splits the stacked fields into two panels.",
  before: { content: "image", label: "Before", src: placeholderScreenshot("before") },
  after: { content: "image", label: "After", src: placeholderScreenshot("after") },
};

const codeWipeScene: CompareSceneData = {
  kind: "compare",
  mode: "wipe",
  heading: "Same file, rewritten",
  say: "The reduce call replaces the manual loop.",
  before: { content: "code", label: "totals.js — before", lang: "js", code: "let sum = 0;\nfor (const x of items) {\n  sum += x.price;\n}" },
  after: { content: "code", label: "totals.js — after", lang: "js", code: "const sum = items.reduce(\n  (s, x) => s + x.price,\n  0,\n);" },
};

const codeRanges = buildSequence(sceneSteps(codeScene), FPS, codeScene.pace);
const codeTotal = sceneDuration(codeScene, FPS);
const wipeTotal = sceneDuration(wipeScene, FPS);
const codeWipeTotal = sceneDuration(codeWipeScene, FPS);
const codeRange = Object.values(codeRanges)[0];

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "CompareScene",
  group: "scenes",
  description: "Wraps Comparison: two panes side by side (\"columns\") or under a moving divider (\"wipe\").",
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
      name: `Pinned mid-wipe, code panes (frame ${Math.round(codeWipeTotal * 0.5)}/${codeWipeTotal})`,
      description: "A code pane names itself in CodeBlock's own header, so no label Badge is drawn over it.",
      render: () => (
        <PinnedFrame frame={Math.round(codeWipeTotal * 0.5)} durationInFrames={codeWipeTotal}>
          <Frame><CompareScene scene={codeWipeScene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned mid-wipe (frame ${Math.round(wipeTotal * 0.4)}/${wipeTotal})`,
      description: "The divider sits partway across, driven by the scene's own beat progress — never dragged.",
      render: () => (
        <PinnedFrame frame={Math.round(wipeTotal * 0.4)} durationInFrames={wipeTotal}>
          <Frame><CompareScene scene={wipeScene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
