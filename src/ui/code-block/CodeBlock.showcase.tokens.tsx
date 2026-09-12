import type { ShowcaseDemo } from "../../showcase/types";
import { CodeBlock, tokenizeCode } from ".";
import type { HighlightedLine } from ".";

// #36: `tokens` lets a consumer bring pre-tokenised lines for a language
// outside the built-in tokenizer's set (e.g. a Lezer/CM6 parser VSNote
// already runs for its editor), or post-process the built-in tokenizer's
// own output.
const rustCode = `fn fibonacci(n: u32) -> u64 {
    let (mut a, mut b) = (0, 1);
    for _ in 0..n {
        let next = a + b;
        a = b;
        b = next;
    }
    a
}`;

const rustTokens: HighlightedLine[] = [
  [{ text: "fn", kind: "keyword" }, { text: " ", kind: "whitespace" }, { text: "fibonacci", kind: "identifier" }, { text: "(", kind: "punctuation" }, { text: "n", kind: "identifier" }, { text: ":", kind: "punctuation" }, { text: " ", kind: "whitespace" }, { text: "u32", kind: "type" }, { text: ")", kind: "punctuation" }, { text: " ", kind: "whitespace" }, { text: "->", kind: "operator" }, { text: " ", kind: "whitespace" }, { text: "u64", kind: "type" }, { text: " ", kind: "whitespace" }, { text: "{", kind: "punctuation" }],
  [{ text: "    ", kind: "whitespace" }, { text: "let", kind: "keyword" }, { text: " ", kind: "whitespace" }, { text: "(mut a, mut b)", kind: "identifier" }, { text: " ", kind: "whitespace" }, { text: "=", kind: "operator" }, { text: " ", kind: "whitespace" }, { text: "(0, 1)", kind: "number" }, { text: ";", kind: "punctuation" }],
  [{ text: "    ", kind: "whitespace" }, { text: "for", kind: "keyword" }, { text: " ", kind: "whitespace" }, { text: "_", kind: "identifier" }, { text: " ", kind: "whitespace" }, { text: "in", kind: "keyword" }, { text: " ", kind: "whitespace" }, { text: "0..n", kind: "number" }, { text: " ", kind: "whitespace" }, { text: "{", kind: "punctuation" }],
  [{ text: "        ", kind: "whitespace" }, { text: "let", kind: "keyword" }, { text: " ", kind: "whitespace" }, { text: "next", kind: "identifier" }, { text: " ", kind: "whitespace" }, { text: "=", kind: "operator" }, { text: " ", kind: "whitespace" }, { text: "a + b", kind: "identifier" }, { text: ";", kind: "punctuation" }],
  [{ text: "        ", kind: "whitespace" }, { text: "a", kind: "identifier" }, { text: " ", kind: "whitespace" }, { text: "=", kind: "operator" }, { text: " ", kind: "whitespace" }, { text: "b", kind: "identifier" }, { text: ";", kind: "punctuation" }],
  [{ text: "        ", kind: "whitespace" }, { text: "b", kind: "identifier" }, { text: " ", kind: "whitespace" }, { text: "=", kind: "operator" }, { text: " ", kind: "whitespace" }, { text: "next", kind: "identifier" }, { text: ";", kind: "punctuation" }],
  [{ text: "    ", kind: "whitespace" }, { text: "}", kind: "punctuation" }],
  [{ text: "    ", kind: "whitespace" }, { text: "a", kind: "identifier" }],
  [{ text: "}", kind: "punctuation" }],
];

const tsLogCode = `function reportError(err: Error) {
  console.error("Request failed:", err.message);
  console.warn("Retrying in 2s");
}`;

const tsLogTokens: HighlightedLine[] = (tokenizeCode(tsLogCode, "ts") ?? []).map((line) =>
  line.map((token) =>
    token.kind === "identifier" && token.text === "console" ? { ...token, kind: "type" } : token,
  ),
);

export const tokensDemos: ShowcaseDemo[] = [
  {
    name: "Pre-tokenised lines",
    description: "tokens bypasses the built-in tokenizer for a language it doesn't cover — here a literal HighlightedLine[] for Rust.",
    render: () => (
      <CodeBlock code={rustCode} language="rust" header="fib.rs" showLineNumbers tokens={rustTokens} />
    ),
  },
  {
    name: "Extending the built-in tokenizer",
    description: "tokenizeCode() runs the built-in TS tokenizer, then re-kinds console as a type before passing tokens.",
    render: () => (
      <CodeBlock code={tsLogCode} language="ts" header="report.ts" showLineNumbers tokens={tsLogTokens} />
    ),
  },
];
