import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Camera } from ".";

function box(id: string, label: string) {
  return (
    <div
      id={id}
      key={id}
      className="flex h-24 w-40 shrink-0 items-center justify-center rounded-ui bg-secondary text-sm text-secondary-fg"
    >
      {label}
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Camera",
  group: "motion",
  description:
    "Pan and zoom over children via GPU-composited transform only, eased between keyframes.",
  demos: [
    {
      name: "Pan and fit zoom",
      description: "Camera moves from an overview to node-a, then node-c, fitting the zoom to each.",
      render: () => (
        <MotionPreview durationInFrames={150} leadIn>
          <div style={{ height: 220 }}>
            <Camera
              keyframes={[
                { at: 0, focus: { x: 0, y: 0, width: 560, height: 96 } },
                { at: 45, focus: "node-a" },
                { at: 105, focus: "node-c" },
              ]}
            >
              <div className="flex gap-panel p-panel">
                {box("node-a", "A")}
                {box("node-b", "B")}
                {box("node-c", "C")}
              </div>
            </Camera>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "spring=\"bouncy\"",
      description: "A springy camera move overshoots slightly before settling on node-b.",
      render: () => (
        <MotionPreview durationInFrames={150} loop leadIn>
          <div style={{ height: 220 }}>
            <Camera
              spring="bouncy"
              keyframes={[
                { at: 0, focus: { x: 0, y: 0, width: 560, height: 96 } },
                { at: 60, focus: "node-b-spring" },
              ]}
            >
              <div className="flex gap-panel p-panel">
                {box("node-a-spring", "A")}
                {box("node-b-spring", "B")}
                {box("node-c-spring", "C")}
              </div>
            </Camera>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
