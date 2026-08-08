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
    "Pan + zoom over children via GPU-composited transform only. focus: elementId measures descendants with offsetLeft/offsetTop (never getBoundingClientRect, which would already be scaled once the scene layer is transformed).",
  demos: [
    {
      name: "pan between elements, fit zoom",
      description: "Camera moves from a full overview to node-a, then to node-c, fitting the zoom to each.",
      render: () => (
        <MotionPreview durationInFrames={150}>
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
  ],
};

export default entry;
