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
  // Every coordinate below lands on something the placeholder screenshot
  // actually draws (see placeholderScreenshot.ts's 640×400 viewBox: x% =
  // x/6.4, y% = y/4). A walkthrough whose cursor clicks empty background and
  // whose spotlight lights a blank rectangle demonstrates the plumbing but
  // not the feature.
  steps: [
    // The highlighted "Workspace" row in the sidebar (8,98 144×24).
    { say: "Open workspace settings.", to: { x: 12.5, y: 27.5 }, action: "click" },
    // No `to` here on purpose — when `spotlight` is set, the cursor's
    // target IS the spotlight rect's own center (WalkthroughScene's
    // resolveTarget()), so the cursor always lands exactly inside the
    // highlighted region instead of a hand-typed `to` that has to be kept
    // in sync with the rect by eye. The rect covers the first form field,
    // label included (204,120 392×58).
    { say: "This is where you rename your workspace.", spotlight: { x: 31.9, y: 30, width: 61.3, height: 14.5 }, annotate: "Rename here" },
    // The same field's input box (212,142 376×28).
    { say: "Type the new name.", to: { x: 62.5, y: 39 }, type: "Jordan Lee" },
    // The primary button at the bottom of the card (476,296 112×28).
    { say: "Save the change.", to: { x: 83.1, y: 77.5 }, action: "click" },
  ],
};

const ranges = buildSequence(sceneSteps(scene), FPS, scene.pace);
const total = sceneDuration(scene, FPS);
const step1 = ranges["step-1"];
const step2 = ranges["step-2"];
const step3 = ranges["step-3"];
/** Middle of the spotlighted step — past its fade-in, before the ramp-out
 * that WalkthroughScene.spotlight.ts runs over the step's final frames. */
const spotlightHold = Math.round((step1.startFrame + step1.endFrame) / 2);

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "WalkthroughScene",
  group: "scenes",
  description: "DeviceFrame, Cursor and Spotlight over a static screenshot, as an alternative to a screen recording.",
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
      name: `Pinned with a spotlight + Annotation, step 2 (frame ${spotlightHold}/${total})`,
      description: "The workspace-name field is lit, everything else dims, and a \"Rename here\" callout is pinned.",
      render: () => (
        <PinnedFrame frame={spotlightHold} durationInFrames={total}>
          <Frame><WalkthroughScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned mid spotlight-exit, end of step 2 (frame ${step1.endFrame - 2}/${total})`,
      description: "The scrim ramps out over the tail of the step, so it is already clear when step 3 begins.",
      render: () => (
        <PinnedFrame frame={step1.endFrame - 2} durationInFrames={total}>
          <Frame><WalkthroughScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned mid-typing, step 3 (frame ${step2.startFrame + 5}/${total})`,
      description: "A \"Jordan Lee\" text bubble sits near the cursor, from the step's `type` field rather than `action`.",
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
