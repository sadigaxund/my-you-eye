import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { buildSequence } from "../../motion/core";
import { ChartScene } from ".";
import { sceneSteps, sceneDuration } from "../timing";
import type { ChartScene as ChartSceneData } from "../schema";

const FPS = 30;

const barScene: ChartSceneData = {
  kind: "chart",
  title: "Signups by channel",
  chart: {
    type: "bar",
    categories: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    series: [
      { label: "Organic", data: [40, 55, 48, 62, 58] },
      { label: "Paid", data: [20, 28, 24, 30, 26] },
    ],
    format: "number",
  },
  steps: [
    { say: "Organic signups lead the week.", series: ["Organic"] },
    { say: "Paid acquisition adds a smaller, steady stream.", series: ["Organic", "Paid"] },
    { say: "Friday's organic number is the one to remember.", focus: "Fri", callout: { value: 58, label: "Fri · Organic", format: "number" } },
  ],
};

const gaugeScene: ChartSceneData = {
  kind: "chart",
  title: "Error budget",
  chart: {
    type: "gauge",
    value: 72,
    min: 0,
    max: 100,
    bands: [{ upTo: 60, status: "success" }, { upTo: 85, status: "warning" }, { upTo: 100, status: "danger" }],
    format: "percent",
  },
};

const barRanges = buildSequence(sceneSteps(barScene), FPS, barScene.pace);
const barTotal = sceneDuration(barScene, FPS);
const gaugeTotal = sceneDuration(gaugeScene, FPS);
const step0 = barRanges["step-0"];
const step1 = barRanges["step-1"];
const step2 = barRanges["step-2"];

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "ChartScene",
  group: "scenes",
  description: "Wraps whichever chart ChartSpec.type selects and drives its progress prop step by step.",
  demos: [
    {
      name: "Bar — playing",
      render: () => (
        <MotionPreview durationInFrames={barTotal} fps={FPS}>
          <Frame><ChartScene scene={barScene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: `Pinned with only "Organic" revealed, step 0 end (frame ${step0.endFrame - 1}/${barTotal})`,
      description: "Only the Organic series bars are drawn, because no step has named Paid yet.",
      render: () => (
        <PinnedFrame frame={step0.endFrame - 1} durationInFrames={barTotal}>
          <Frame><ChartScene scene={barScene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned mid-reveal of "Paid", step 1 (frame ${step1.startFrame + Math.round((step1.endFrame - step1.startFrame) / 2)}/${barTotal})`,
      description: "Both series are now included and draw on together, since the chart's single `progress` scales every included bar.",
      render: () => (
        <PinnedFrame frame={step1.startFrame + Math.round((step1.endFrame - step1.startFrame) / 2)} durationInFrames={barTotal}>
          <Frame><ChartScene scene={barScene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned with focus + callout, step 2 (frame ${step2.endFrame - 1}/${barTotal})`,
      description: "Fri's bars stay lit, every other day dims, and the callout has counted up to 58.",
      render: () => (
        <PinnedFrame frame={step2.endFrame - 1} durationInFrames={barTotal}>
          <Frame><ChartScene scene={barScene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "Gauge — no steps (single-beat draw-on)",
      description: "A chart scene with no `steps` array draws the whole chart on over one implicit beat.",
      render: () => (
        <MotionPreview durationInFrames={gaugeTotal} fps={FPS}>
          <Frame><ChartScene scene={gaugeScene} /></Frame>
        </MotionPreview>
      ),
    },
  ],
};
export default entry;
