import type { ShowcaseEntry } from "../../showcase/types";
import { Markdown } from ".";

const sample = `# Heading 1

## Heading 2

A paragraph with **bold**, *italic*, \`inline code\`, and a [link](https://example.com).

- List item one
- List item two
- List item three

\`\`\`
// Code block
function hello() {
  console.log("Hello, world!");
}
\`\`\`

Another paragraph after the code block.`;

const entry: ShowcaseEntry = {
  title: "Markdown",
  group: "display",
  demos: [
    {
      name: "Rendered markdown",
      render: () => (
        <div className="max-w-lg">
          <Markdown content={sample} />
        </div>
      ),
    },
  ],
};
export default entry;
