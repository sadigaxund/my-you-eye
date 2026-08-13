import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { TypeText } from ".";

const entry: ShowcaseEntry = {
  title: "TypeText",
  group: "motion",
  description:
    "Types out text char/word/line at a time, as a pure function of progress. Inherits typography from className instead of hardcoding a font; preserveLayout reserves the final box size so nothing reflows while typing. Not centered like most other motion demos here — a centered growing line of text would visibly jitter sideways every frame as its own width changes, which is worse than the flush-left space it trades away.",
  demos: [
    {
      name: "char mode",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <TypeText className="font-mono text-sm text-fg" text="const answer = 42;" duration="slow" />
        </MotionPreview>
      ),
    },
    {
      name: "word mode",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <TypeText className="text-base text-fg" text="Types word by word instead of char by char." mode="word" duration="slow" />
        </MotionPreview>
      ),
    },
    {
      name: "caret variants",
      description: 'caret: "bar" | "block" | "underline" | "none" — shape while typing/blinking; unrelated to whether it shows at all (cursor).',
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="flex flex-col gap-tight font-mono text-sm text-fg">
            <TypeText text="bar caret_" caret="bar" duration="slow" />
            <TypeText text="block caret_" caret="block" duration="slow" delay="quick" />
            <TypeText text="underline caret_" caret="underline" duration="slow" delay="normal" />
            <TypeText text="no caret at all" caret="none" duration="slow" delay="slow" />
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "preserveLayout (no reflow)",
      description: "The box is full-size from frame 0 — surrounding content never jumps as text fills in.",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
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
