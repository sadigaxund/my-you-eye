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

const entry: ShowcaseEntry = {
  title: "CodeBlock",
  group: "display",
  demos: [
    {
      name: "Basic",
      render: () => (
        <div className="max-w-xl">
          <CodeBlock code={python} language="python" />
        </div>
      ),
    },
    {
      name: "With header",
      render: () => (
        <div className="max-w-xl">
          <CodeBlock code={json} language="json" header="package.json" />
        </div>
      ),
    },
  ],
};
export default entry;
