import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { TypeText } from ".";

const entry: ShowcaseEntry = {
  title: "TypeText",
  group: "motion",
  description:
    "Types out text char/word/line at a time, as a pure function of progress. Inherits typography from className instead of hardcoding a font; preserveLayout reserves the final box size so nothing reflows while typing.",
  demos: [
    {
      name: "char mode",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <TypeText className="font-mono text-sm text-fg" text="const answer = 42;" duration="slow" />
        </MotionPreview>
      ),
    },
    {
      name: "word mode",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <TypeText className="text-base text-fg" text="Types word by word instead of char by char." mode="word" duration="slow" />
        </MotionPreview>
      ),
    },
    {
      name: "preserveLayout (no reflow)",
      description: "The box is full-size from frame 0 — surrounding content never jumps as text fills in.",
      render: () => (
        <MotionPreview durationInFrames={90}>
          <div className="flex flex-col gap-tight">
            <TypeText className="font-mono text-sm text-fg" text="preserveLayout keeps the box stable" duration="slow" preserveLayout />
            <div className="rounded-ui bg-secondary px-panel py-compact-y text-xs text-secondary-fg">
              this row never moves
            </div>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
