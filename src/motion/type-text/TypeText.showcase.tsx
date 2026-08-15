import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { TypeText } from ".";

// None of these demos pass `center` to MotionPreview, unlike most of the
// motion showcases. A centered, still-growing line of text re-centers itself
// every frame as its own width changes, which reads as sideways jitter —
// worse than the flush-left whitespace it would trade away. Keep them
// left-aligned.
const entry: ShowcaseEntry = {
  title: "TypeText",
  group: "motion",
  description:
    "Types out text char, word or line at a time, as a pure function of progress.",
  demos: [
    {
      name: "Char mode",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <TypeText className="font-mono text-sm text-fg" text="const answer = 42;" duration="slow" />
        </MotionPreview>
      ),
    },
    {
      name: "Word mode",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <TypeText className="text-base text-fg" text="Types word by word instead of char by char." mode="word" duration="slow" />
        </MotionPreview>
      ),
    },
    {
      name: "Caret variants",
      description: 'caret: "bar" | "block" | "underline" | "none" — shape only; cursor controls whether it shows.',
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
