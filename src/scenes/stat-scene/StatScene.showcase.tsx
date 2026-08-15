import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { buildSequence } from "../../motion/core";
import { StatScene } from ".";
import { sceneSteps, sceneDuration } from "../timing";
import type { StatScene as StatSceneData } from "../schema";

const FPS = 30;

const scene: StatSceneData = {
  kind: "stat",
  heading: "This quarter",
  columns: 4,
  stats: [
    { say: "Revenue is up.", label: "Revenue", value: 48200, format: "compact", delta: 12.4 },
    { say: "Active users grew too.", label: "Active users", value: 8204, delta: 6.1, sparkline: [40, 44, 42, 48, 52, 50, 58, 63, 60, 68] },
    { say: "Churn is down — that's good news.", label: "Churn", value: 0.021, format: "percent", delta: -0.004 },
    { say: "Latency crept up, which is bad news even though the number went up.", label: "Latency (ms)", value: 182, delta: 14.2, positiveIsGood: false },
  ],
};

const ranges = buildSequence(sceneSteps(scene), FPS, scene.pace);
const total = sceneDuration(scene, FPS);
const step0 = ranges["step-0"];
const step3 = ranges["step-3"];

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "StatScene",
  group: "scenes",
  description: "StatGrid with per-tile staggered CountUp, delta arrows and inline Sparklines, one step per tile.",
  demos: [
    {
      name: "Playing",
      render: () => (
        <MotionPreview durationInFrames={total} fps={FPS}>
          <Frame><StatScene scene={scene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: `Pinned mid-count, tile 1 (frame ${step0.startFrame + 3}/${total})`,
      description: "Only the Revenue tile has appeared, still counting up toward 48.2k.",
      render: () => (
        <PinnedFrame frame={step0.startFrame + 3} durationInFrames={total}>
          <Frame><StatScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned at rest, all four tiles (frame ${step3.endFrame - 1}/${total})`,
      description: "Everything has settled, and Latency reads danger-red despite rising because positiveIsGood: false flips the colour while the glyph follows the raw sign.",
      render: () => (
        <PinnedFrame frame={step3.endFrame - 1} durationInFrames={total}>
          <Frame><StatScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
