import type { ShowcaseEntry } from "../../showcase/types";
import { CodeBlock } from ".";

const python = `def fibonacci(n):
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b`;

const json = `{
  "name": "example",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.0.0"
  }
}`;

const longLine = `const veryLongVariableNameThatForcesHorizontalScrolling = someFunctionCall(argumentOne, argumentTwo, argumentThree, argumentFour);`;

const entry: ShowcaseEntry = {
  title: "CodeBlock",
  group: "display",
  demos: [
    {
      name: "Bare (no header, no language)",
      render: () => (
        <CodeBlock code={python} />
      ),
    },
    {
      name: "Language-only (badge overlay, no header bar)",
      render: () => (
        <CodeBlock code={python} language="python" />
      ),
    },
    {
      name: "With header + language",
      render: () => (
        <CodeBlock code={json} language="json" header="package.json" />
      ),
    },
    {
      name: "Elevated",
      render: () => (
        <CodeBlock code={python} language="python" header="fib.py" variant="elevated" />
      ),
    },
    {
      name: "Line numbers",
      render: () => (
        <CodeBlock code={python} language="python" header="fib.py" showLineNumbers />
      ),
    },
    {
      name: "No wrap (horizontal scroll)",
      render: () => (
        <CodeBlock code={longLine} language="ts" header="scroll.ts" wrap={false} showLineNumbers />
      ),
    },
  ],
};
export default entry;
