import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { CodeDiff } from ".";

const before = `function total(items) {
  let sum = 0;
  for (const item of items) {
    sum += item.price;
  }
  return sum;
}`;

const after = `function total(items, taxRate = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 + taxRate);
}`;

const entry: ShowcaseEntry = {
  title: "CodeDiff",
  group: "scenes",
  description:
    "Animates between two full sources inside a CodeBlock-styled frame: added rows grow in, removed rows collapse out, changed rows cross-fade word-by-word (via DiffBlock's wordDiff). The scenes-tier CodeScene renders this for any step whose code differs from what was on screen before it.",
  demos: [
    {
      name: "Playing",
      description: "The full change plays out — two lines are removed and rewritten as one reduce() call, the signature grows a taxRate parameter, and the return statement's math changes.",
      render: () => (
        <MotionPreview durationInFrames={150}>
          <CodeDiff from={before} to={after} language="js" header="totals.js" duration={150} />
        </MotionPreview>
      ),
    },
    {
      name: "Pinned mid-transition (frame 70/150)",
      description: "Paused partway through: the changed lines are mid-crossfade, the removed loop lines are partway collapsed, and the added reduce()/taxRate text is partway grown in.",
      render: () => (
        <PinnedFrame frame={70} durationInFrames={150}>
          <CodeDiff from={before} to={after} language="js" header="totals.js" duration={150} />
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned at rest (frame 150/150)",
      description: "The settled end state — reads exactly like a plain CodeBlock showing `after`.",
      render: () => (
        <PinnedFrame frame={150} durationInFrames={150}>
          <CodeDiff from={before} to={after} language="js" header="totals.js" duration={150} />
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
