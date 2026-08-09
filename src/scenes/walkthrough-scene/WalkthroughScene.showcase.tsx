import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { placeholderScreenshot } from "../../showcase/placeholderScreenshot";
import { buildSequence } from "../../motion/core";
import { WalkthroughScene } from ".";
import { sceneSteps, sceneDuration } from "../timing";
import type { WalkthroughScene as WalkthroughSceneData } from "../schema";

const FPS = 30;

const scene: WalkthroughSceneData = {
  kind: "walkthrough",
  frame: "browser",
  url: "app.example.com/settings",
  title: "Settings",
  image: placeholderScreenshot(),
  steps: [
    { say: "Open the profile card.", to: { x: 25, y: 35 }, action: "click" },
    { say: "This is where you rename your workspace.", to: { x: 25, y: 35 }, spotlight: { x: 4, y: 22, width: 44, height: 33 }, annotate: "Rename here" },
    { say: "Type the new name.", to: { x: 25, y: 35 }, type: "Jordan Lee" },
    { say: "Save the change.", to: { x: 90, y: 91 }, action: "click" },
  ],
};

const ranges = buildSequence(sceneSteps(scene), FPS, scene.pace);
const total = sceneDuration(scene, FPS);
const step1 = ranges["step-1"];
const step2 = ranges["step-2"];
const step3 = ranges["step-3"];

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "WalkthroughScene",
  group: "scenes",
  description: "DeviceFrame + the Cursor primitive (which renders a Ripple on click internally) + Spotlight, over a static screenshot — the alternative to a screen recording. PercentPoint/PercentRect step coordinates convert to pixels against the measured device-frame content box.",
  demos: [
    {
      name: "Playing",
      render: () => (
        <MotionPreview durationInFrames={total} fps={FPS}>
          <Frame><WalkthroughScene scene={scene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: `Pinned with a spotlight + Annotation, step 2 (frame ${step1.endFrame - 1}/${total})`,
      description: "The profile card region is lit; everything else in the screenshot dims. A \"Rename here\" callout is pinned at the cursor's position.",
      render: () => (
        <PinnedFrame frame={step1.endFrame - 1} durationInFrames={total}>
          <Frame><WalkthroughScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned mid-typing, step 3 (frame ${step2.startFrame + 5}/${total})`,
      description: "A \"Jordan Lee\" text bubble is shown near the cursor — the step's `type` field, distinct from `action`.",
      render: () => (
        <PinnedFrame frame={step2.startFrame + 5} durationInFrames={total}>
          <Frame><WalkthroughScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned on the final click, step 4 (frame ${step3.startFrame + 2}/${total})`,
      description: "The cursor has arrived at the save button and a Ripple is expanding from the click.",
      render: () => (
        <PinnedFrame frame={step3.startFrame + 2} durationInFrames={total}>
          <Frame><WalkthroughScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
