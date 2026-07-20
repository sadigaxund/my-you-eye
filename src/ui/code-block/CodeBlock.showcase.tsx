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

const typescript = `interface User {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

async function fetchUser(id: number): Promise<User | null> {
  const res = await fetch(\`/api/users/\${id}\`);
  if (!res.ok) return null;
  return res.json();
}

// Usage
const user = await fetchUser(42);
console.log(user?.name ?? "Unknown");`;

const cssSample = `.card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: var(--radius-ui);
  background: var(--color-surface);
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  .card { background: var(--color-bg); }
}`;

const htmlSample = `<article class="post">
  <header>
    <h2><a href="/post/42">Hello World</a></h2>
    <time datetime="2026-07-17">July 17, 2026</time>
  </header>
  <p>Welcome to my blog.</p>
  <footer><a href="/tags">#tech</a></footer>
</article>`;

const sqlSample = `SELECT u.id, u.name, COUNT(o.id) AS orders
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = TRUE
  AND u.created_at > '2026-01-01'
GROUP BY u.id, u.name
ORDER BY orders DESC
LIMIT 10;`;

const yamlSample = `# GitHub Actions workflow
name: CI
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - name: Install
        run: npm ci
      - name: Test
        run: npm test`;


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
    {
      name: "Syntax highlighting (TS)",
      render: () => (
        <CodeBlock code={typescript} language="typescript" header="api.ts" showLineNumbers highlight />
      ),
    },
    {
      name: "Line highlights",
      render: () => (
        <CodeBlock code={typescript} language="typescript" header="api.ts" highlightLines={[1, 2, 3, 4, 5]} showLineNumbers highlight />
      ),
    },
    {
      name: "Line highlights (implicit gutter)",
      render: () => (
        <CodeBlock code={python} language="python" header="fib.py" highlightLines={[1, 3, 5]} />
      ),
    },
    {
      name: "Multi-color highlights",
      render: () => (
        <CodeBlock
          code={typescript}
          language="typescript"
          header="api.ts"
          showLineNumbers
          highlight
          highlightGroups={[
            { lines: [1, 2, 3, 5], color: "primary" },
            { lines: [10, 11, 12], color: "warning" },
            { lines: [14], color: "success" },
          ]}
        />
      ),
    },
    {
      name: "Substring highlights",
      render: () => {
        const sample = `function process(order: Order): Result {\n  if (!order.valid) throw new Error("Bad order");\n  const total = order.items.reduce((s, i) => s + i.price, 0);\n  return { id: order.id, total, status: "done" };\n}`;
        return (
          <CodeBlock
            code={sample}
            language="typescript"
            header="process.ts"
            showLineNumbers
            highlight
            highlightRanges={[
              { line: 2, start: 6, end: 18, color: "danger" },
              { line: 3, start: 15, end: 45, color: "warning" },
              { line: 4, start: 13, end: 33, color: "success" },
            ]}
          />
        );
      },
    },
    {
      name: "Merged highlights",
      render: () => (
        <CodeBlock
          code={`class OrderService {\n  async submit(order: Order) {\n    if (order.items.length === 0) {\n      throw new ValidationError(\n        "Order must have items"\n      );\n    }\n    const total = order.items\n      .map((i) => i.price * i.qty)\n      .reduce((s, v) => s + v, 0);\n    return this.repo.save({ ...order, total });\n  }\n}`}
          language="typescript"
          header="order.ts"
          showLineNumbers
          highlight
          highlightRanges={[
            { line: 2, start: 16, end: 41, color: "primary" },
            { line: 3, start: 8, end: 34, color: "primary" },
            { line: 4, start: 6, end: 28, color: "primary" },
            { line: 5, start: 8, end: 30, color: "primary" },
            { line: 7, start: 16, end: 36, color: "primary" },
            { line: 8, start: 6, end: 36, color: "primary" },
            { line: 9, start: 6, end: 44, color: "primary" },
          ]}
        />
      ),
    },
    {
      name: "Syntax highlighting (CSS / HTML / SQL / YAML / Python)",
      render: () => (
        <div className="flex flex-col gap-4">
          <CodeBlock code={cssSample} language="css" header="card.css" highlight />
          <CodeBlock code={htmlSample} language="html" header="post.html" highlight />
          <CodeBlock code={sqlSample} language="sql" header="query.sql" highlight />
          <CodeBlock code={yamlSample} language="yaml" header="ci.yml" highlight />
          <CodeBlock code={python} language="python" header="fib.py" highlight />
        </div>
      ),
    },
  ],
};
export default entry;
