import type { ShowcaseEntry } from "../../showcase/types";
import { Annotation } from ".";
import { DeviceFrame } from "../device-frame";

function MockScreenshot() {
  return (
    <DeviceFrame variant="browser" url="app.example.com" className="h-full">
      <div className="flex flex-col gap-3 p-4">
        <div className="h-8 w-40 rounded-ui bg-secondary" />
        <div className="grid grid-cols-3 gap-3">
          <div className="h-16 rounded-ui border border-border bg-surface" />
          <div className="h-16 rounded-ui border border-border bg-surface" />
          <div className="h-16 rounded-ui border border-border bg-surface" />
        </div>
      </div>
    </DeviceFrame>
  );
}

const entry: ShowcaseEntry = {
  title: "Annotation",
  group: "canvas",
  description:
    "A callout with a leader line that points at a target, for picking out part of a diagram or screenshot in a video. Its path math and arrow-marker angle come straight from connection-line/geometry.ts.",
  demos: [
    {
      name: "Marker variants",
      description: "Pointer-end decoration at the target: \"none\", \"arrow\" (default), \"pin\".",
      render: () => (
        <div className="relative mx-auto" style={{ width: 480, height: 240 }}>
          <MockScreenshot />
          <Annotation target={{ x: 200, y: 40 }} label="New nav item" marker="arrow" />
          <Annotation target={{ x: 340, y: 140 }} label="Card grid" marker="pin" accentColor="success" />
          <Annotation target={{ x: 60, y: 140 }} label="Empty — needs a CTA" side="left" marker="none" accentColor="warning" />
        </div>
      ),
    },
    {
      name: "Auto-flip near the container edge",
      description:
        "containerWidth is the only signal Annotation needs to flip: a label that would run past that edge on `side` renders on the opposite side instead.",
      render: () => (
        <div className="relative rounded-ui border border-dashed border-border" style={{ width: 380, height: 160 }}>
          <Annotation
            target={{ x: 40, y: 50 }}
            label="Flips right — would run off the left edge"
            side="left"
            containerWidth={380}
          />
          <Annotation
            target={{ x: 340, y: 120 }}
            label="Flips left — would run off the right edge"
            side="right"
            containerWidth={380}
            accentColor="danger"
          />
        </div>
      ),
    },
    {
      name: "Vertical sides (top/bottom)",
      description: "side=\"top\" and \"bottom\" anchor the label directly above or below the target instead of beside it, for DiagramScene's node callouts; there is no auto-flip on this axis, because there is no containerHeight to flip against.",
      render: () => (
        <div className="relative mx-auto" style={{ width: 480, height: 240 }}>
          <MockScreenshot />
          <Annotation target={{ x: 200, y: 40 }} label="Above the header" side="top" marker="arrow" />
          <Annotation target={{ x: 340, y: 140 }} label="Below the card" side="bottom" marker="pin" accentColor="success" />
        </div>
      ),
    },
    {
      name: "Progress reveal",
      description:
        "progress (0→1) strokes the leader line on via stroke-dashoffset for the first 60%, then fades the label in over the remaining 40%. It is a pure function of the prop and uses no CSS transition.",
      render: () => (
        <div className="flex gap-6">
          <div className="relative rounded-ui border border-dashed border-border" style={{ width: 220, height: 140 }}>
            <Annotation target={{ x: 200, y: 100 }} label="Drawing…" side="left" progress={0.3} />
          </div>
          <div className="relative rounded-ui border border-dashed border-border" style={{ width: 220, height: 140 }}>
            <Annotation target={{ x: 200, y: 100 }} label="Line done, label fading in" side="left" progress={0.8} />
          </div>
          <div className="relative rounded-ui border border-dashed border-border" style={{ width: 220, height: 140 }}>
            <Annotation target={{ x: 200, y: 100 }} label="Fully revealed" side="left" progress={1} />
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
