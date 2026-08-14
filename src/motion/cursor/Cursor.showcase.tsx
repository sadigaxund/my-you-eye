import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Cursor } from ".";
import type { CursorShape } from ".";

function field(label: string) {
  return <div className="flex h-10 w-24 items-center justify-center rounded-ui bg-secondary text-xs text-secondary-fg">{label}</div>;
}

const SHAPES: CursorShape[] = ["arrow", "hand", "crosshair", "dot"];

const entry: ShowcaseEntry = {
  title: "Cursor",
  group: "motion",
  description:
    "A fake pointer for simulated UI walkthroughs — movement between events is eased (not a raw constant-speed slide), with 4 appearance variants and click feedback rendered via Ripple (see Ripple's own showcase for the click variants themselves).",
  demos: [
    {
      name: "move, click, type",
      description: "Eased movement (spring=\"snappy\" here) between 4 timed events, ending on a click.",
      render: () => (
        <MotionPreview durationInFrames={150} leadIn>
          <div className="relative h-40 w-full overflow-hidden rounded-ui bg-surface">
            <div className="flex gap-panel p-panel">
              {field("Field")}
              {field("Submit")}
            </div>
            <Cursor
              spring="snappy"
              events={[
                { at: 0, x: 20, y: 20 },
                { at: 30, x: 40, y: 40, action: "click" },
                { at: 40, x: 40, y: 40, action: "type", text: "hello@example.com" },
                { at: 90, x: 170, y: 40, action: "click" },
              ]}
            />
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "shapes",
      description: "shape: \"arrow\" | \"hand\" | \"crosshair\" | \"dot\" — each still eases in and clicks so the appearance reads against real motion, not a static glyph.",
      render: () => (
        <MotionPreview durationInFrames={90} loop leadIn>
          <div className="grid grid-cols-4 gap-panel">
            {SHAPES.map((shape) => (
              <div key={shape} className="relative flex h-20 flex-col items-center justify-end gap-tight overflow-hidden rounded-ui bg-surface pb-tight">
                <span className="text-xs text-muted">{shape}</span>
                <Cursor shape={shape} events={[{ at: 0, x: 34, y: 8 }, { at: 60, x: 34, y: 8, action: "click" }]} />
              </div>
            ))}
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "custom cursor node",
      description: "children replaces the built-in glyph entirely — any icon/element, centered on the tracked position by default.",
      render: () => (
        <MotionPreview durationInFrames={90} loop leadIn>
          <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-ui bg-surface">
            <Cursor events={[{ at: 0, x: 44, y: 32 }, { at: 60, x: 44, y: 32, action: "click" }]}>
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-primary bg-surface text-xs font-bold text-primary shadow-card">A</span>
            </Cursor>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "click effect variants",
      description: "clickEffect: \"ring\" | \"solid\" | \"double\" — forwarded straight to Ripple. Each cell moves the cursor in from the side, then clicks, so the press and the ripple firing both read as an actual click rather than a static glyph.",
      render: () => (
        <MotionPreview durationInFrames={90} loop leadIn>
          <div className="grid grid-cols-3 gap-panel">
            <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-ui bg-surface">
              <Cursor shape="dot" clickEffect="ring" events={[{ at: 0, x: 8, y: 60 }, { at: 35, x: 44, y: 32, action: "click" }, { at: 55, x: 44, y: 32 }]} />
            </div>
            <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-ui bg-surface">
              <Cursor shape="dot" clickEffect="solid" color="success" events={[{ at: 0, x: 8, y: 60 }, { at: 35, x: 44, y: 32, action: "click" }, { at: 55, x: 44, y: 32 }]} />
            </div>
            <div className="relative flex h-20 items-center justify-center overflow-hidden rounded-ui bg-surface">
              <Cursor shape="dot" clickEffect="double" color="warning" events={[{ at: 0, x: 8, y: 60 }, { at: 35, x: 44, y: 32, action: "click" }, { at: 55, x: 44, y: 32 }]} />
            </div>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
