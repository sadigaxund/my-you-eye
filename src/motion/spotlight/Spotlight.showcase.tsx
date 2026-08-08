import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Spotlight } from ".";

const entry: ShowcaseEntry = {
  title: "Spotlight",
  group: "motion",
  description: "Dims everything except a focused rect via a box-shadow cut-out — never backdrop-filter (forbidden inside a Canvas transforming subtree, AGENTS.md §0.12).",
  demos: [
    {
      name: "focus rect",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <Spotlight focus={{ x: 90, y: 20, width: 100, height: 48 }} duration="slow">
            <div className="grid grid-cols-3 gap-panel p-panel">
              <div className="flex h-12 items-center justify-center rounded-ui bg-secondary text-sm text-secondary-fg">one</div>
              <div className="flex h-12 items-center justify-center rounded-ui bg-primary text-sm text-primary-fg">focused</div>
              <div className="flex h-12 items-center justify-center rounded-ui bg-secondary text-sm text-secondary-fg">three</div>
            </div>
          </Spotlight>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
