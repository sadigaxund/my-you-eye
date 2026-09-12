import { tokenize, splitTokensByLine } from "./CodeBlock.highlight";

/**
 * The library's own token vocabulary: every built-in tokenizer in
 * `CodeBlock.highlight.tsx` emits one of these, and the `.hl-*` rules in
 * `src/styles/globals.css` are keyed on the same names. An external
 * highlighter (Lezer/CM6/whatever) maps its own tags onto this set and
 * passes pre-tokenised `HighlightedLine[]` via `CodeBlockProps.tokens` —
 * colors stay on library tokens/themes either way.
 */
export type CodeTokenKind =
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "type"
  | "tag"
  | "operator"
  | "key"
  | "identifier"
  | "punctuation"
  | "whitespace";

/** One highlighted span. `kind` omitted (or `"whitespace"`) renders with no
 * color class — plain text. */
export interface CodeToken {
  text: string;
  kind?: CodeTokenKind;
}

/** One rendered line's tokens, in order. */
export type HighlightedLine = readonly CodeToken[];

/**
 * The built-in tokenizer, as a public function: per-line tokens for a
 * language `CodeBlock`/`DiffBlock`/`TerminalOutput` know natively, or `null`
 * when `language` isn't one of them.
 *
 * Built-in language set (by family, with recognized aliases):
 * - JavaScript/TypeScript — `js`, `jsx`, `ts`, `tsx`, `javascript`, `typescript`
 * - JSON — `json`, `tsconfig`
 * - Shell — `bash`, `sh`, `shell`
 * - CSS — `css`, `scss`, `less`
 * - HTML/XML — `html`, `htm`, `xml`
 * - Python — `python`, `py`
 * - YAML — `yaml`, `yml`
 * - SQL — `sql`, `pgsql`, `mysql`
 *
 * For any other language, pre-tokenise and pass `tokens` to `CodeBlock`
 * instead (see `CodeBlockProps.tokens`).
 */
export function tokenizeCode(code: string, language?: string): HighlightedLine[] | null {
  const flat = tokenize(code, language);
  if (!flat) return null;
  return splitTokensByLine(flat);
}
