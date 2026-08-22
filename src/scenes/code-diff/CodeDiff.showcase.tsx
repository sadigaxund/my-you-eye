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
    "Animates between two sources: added rows grow in, removed rows collapse out, changed rows cross-fade.",
  demos: [
    {
      name: "Playing",
      description: "A loop is rewritten as one reduce() call, and the signature grows a taxRate parameter.",
      render: () => (
        <MotionPreview durationInFrames={150}>
          <CodeDiff from={before} to={after} language="js" header="totals.js" duration={150} />
        </MotionPreview>
      ),
    },
    {
      name: "Pinned mid-transition (frame 70/150)",
      description: "The signature's added parameter is boxed as one run; the wholly-rewritten body line keeps just its row tint.",
      render: () => (
        <PinnedFrame frame={70} durationInFrames={150}>
          <CodeDiff from={before} to={after} language="js" header="totals.js" duration={150} />
        </PinnedFrame>
      ),
    },
    {
      name: "Pinned at rest (frame 150/150)",
      description: "The settled end state, which reads exactly like a plain CodeBlock showing `after`.",
      render: () => (
        <PinnedFrame frame={150} durationInFrames={150}>
          <CodeDiff from={before} to={after} language="js" header="totals.js" duration={150} />
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
