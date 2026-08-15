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

const entry: ShowcaseEntry = {
  title: "DiffBlock",
  group: "display",
  description: "Unified and side-by-side diff views, reusing CodeBlock's tokenizer for syntax color and a token-level LCS for optional word diff.",
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
