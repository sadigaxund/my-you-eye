import type { ShowcaseEntry } from "../../showcase/types";
import { DiffBlock } from ".";
import type { DiffLine } from ".";

const basic: DiffLine[] = [
  { type: "context", content: "function greet(name) {", oldLine: 1, newLine: 1 },
  { type: "removed", content: "  console.log('Hello ' + name);", oldLine: 2 },
  { type: "added", content: "  console.log(`Hello ${name}!`);", newLine: 2 },
  { type: "context", content: "}", oldLine: 3, newLine: 3 },
  { type: "context", content: "", oldLine: 4, newLine: 4 },
  { type: "removed", content: "greet('world');", oldLine: 5 },
  { type: "added", content: "greet('World');", newLine: 5 },
  { type: "added", content: "greet('Claude');", newLine: 6 },
];

const config: DiffLine[] = [
  { type: "context", content: "{", oldLine: 1, newLine: 1 },
  { type: "context", content: '  "name": "my-you-eye",', oldLine: 2, newLine: 2 },
  { type: "removed", content: '  "version": "0.3.1",', oldLine: 3 },
  { type: "added", content: '  "version": "0.3.2",', newLine: 3 },
  { type: "context", content: "}", oldLine: 4, newLine: 4 },
];

// Every line here is the kind of rewrite that used to shatter into a dozen
// one-character highlight boxes: punctuation-heavy edits (quote → backtick,
// `+` concatenation → interpolation) where the raw LCS matches stray
// brackets and spaces across otherwise unrelated text. See
// DiffBlock.refine.ts.
const noisy: DiffLine[] = [
  { type: "context", content: "export function label(user, count) {", oldLine: 1, newLine: 1 },
  { type: "removed", content: "  const name = user.firstName + ' ' + user.lastName;", oldLine: 2 },
  { type: "added", content: "  const name = `${user.firstName} ${user.lastName}`;", newLine: 2 },
  { type: "removed", content: "  return name + ' (' + count + ')';", oldLine: 3 },
  { type: "added", content: "  return items.map((i) => i.label).join(', ');", newLine: 3 },
  { type: "context", content: "}", oldLine: 4, newLine: 4 },
];

const entry: ShowcaseEntry = {
  title: "DiffBlock",
  group: "display",
  description: "Unified and side-by-side diff views. They reuse CodeBlock's tokenizer for syntax color and a token-level LCS for the optional word diff.",
  demos: [
    {
      name: "Unified",
      render: () => (
        <div className="max-w-xl mx-auto">
          <DiffBlock header="greet.js" language="js" highlight lines={basic} />
        </div>
      ),
    },
    {
      name: "Unified — word diff",
      description: "wordDiff highlights only the differing tokens within a 1:1 changed-line pair.",
      render: () => (
        <div className="max-w-xl mx-auto">
          <DiffBlock header="greet.js" lines={basic} wordDiff />
        </div>
      ),
    },
    {
      name: "Unified — word diff, heavily rewritten lines",
      description: "Noise runs are absorbed into their neighbours; a line that changed past ~55% keeps only its row tint.",
      render: () => (
        <div className="max-w-xl mx-auto">
          <DiffBlock header="label.js" lines={noisy} wordDiff />
        </div>
      ),
    },
    {
      name: "Split",
      render: () => (
        <div className="max-w-2xl mx-auto">
          <DiffBlock header="package.json" language="json" highlight mode="split" lines={config} />
        </div>
      ),
    },
    {
      name: "Split — word diff",
      render: () => (
        <div className="max-w-2xl mx-auto">
          <DiffBlock header="package.json" mode="split" lines={config} wordDiff />
        </div>
      ),
    },
    {
      name: "Elevated",
      render: () => (
        <div className="max-w-xl mx-auto">
          <DiffBlock header="greet.js" language="js" highlight variant="elevated" lines={basic} />
        </div>
      ),
    },
  ],
};
export default entry;
