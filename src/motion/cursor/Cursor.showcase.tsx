import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Cursor } from ".";

const entry: ShowcaseEntry = {
  title: "Cursor",
  group: "motion",
  description: "A fake pointer that moves along timed events and renders a Ripple on click/dblclick — for simulated UI walkthroughs.",
  demos: [
    {
      name: "move, click, type",
      render: () => (
        <MotionPreview durationInFrames={150}>
          <div className="relative h-40 w-full overflow-hidden rounded-ui bg-surface">
            <div className="flex gap-panel p-panel">
              <div className="flex h-10 w-24 items-center justify-center rounded-ui bg-secondary text-xs text-secondary-fg">Field</div>
              <div className="flex h-10 w-24 items-center justify-center rounded-ui bg-secondary text-xs text-secondary-fg">Submit</div>
            </div>
            <Cursor
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
  ],
};

export default entry;
