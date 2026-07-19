import type { ShowcaseEntry } from "../../showcase/types";
import { Markdown } from ".";

const sample = `# Heading 1

## Heading 2

### Heading 3

A paragraph with **bold**, *italic*, \`inline code\`, and a [link](https://example.com). You can also have **bold with *nested* italic** inside.

- List item one
- List item two that is a bit longer to demonstrate text wrapping in list items
- List item three

\`\`\`javascript
// Code block
function hello() {
  console.log("Hello, world!");
}
\`\`\`

#### Heading 4

Another paragraph after the code block. This one is deliberately a bit longer so it wraps across multiple lines and creates a more realistic reading experience.

- Apples
- Oranges
- Carrots
- Broccoli

\`\`\`
npm run dev
\`\`\`

##### Heading 5

| Package | Version | Status |
|---------|---------|--------|
| @radix-ui/react-dialog | 1.1.x | Stable |
| @radix-ui/react-select | 2.1.x | Stable |
| @radix-ui/react-tooltip | 1.2.x | Beta |

A final paragraph with a trailing [link back](#).`;

const entry: ShowcaseEntry = {
  title: "Markdown",
  group: "display",
  demos: [
    {
      name: "Rendered markdown",
      render: () => (
        <div className="max-w-lg mx-auto">
          <Markdown content={sample} />
        </div>
      ),
    },
  ],
};
export default entry;
