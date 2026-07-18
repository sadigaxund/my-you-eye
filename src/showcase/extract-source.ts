/**
 * Best-effort extraction of a single demo's JSX source out of the raw text
 * of a `*.showcase.tsx` file, keyed by the demo's `name` field.
 *
 * This is NOT a real parser — it's a bracket/tag-balanced scanner tuned to
 * the one shape every showcase file uses:
 *
 *   { name: "Foo", render: () => ( <JSX/> ) }
 *   { name: "Foo", render: () => <JSX/> }
 *
 * It must fail SOFTLY: if a demo doesn't match this shape (or the scanner
 * gets confused by something exotic), return `null` rather than throwing or
 * emitting garbage. Callers hide the preview/code toggle when this happens.
 */

/** Escape a string for safe use inside a `new RegExp(...)`. */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Skip a quoted string (', ", or `) starting at `i` (which points at the opening quote). */
function skipString(src: string, i: number, quote: string): number {
  let j = i + 1;
  while (j < src.length) {
    if (src[j] === "\\") {
      j += 2;
      continue;
    }
    if (src[j] === quote) return j + 1;
    j++;
  }
  return src.length;
}

/**
 * Find the index just past the `>` that closes a JSX tag opening at `i`
 * (which points at the `<`). Braces are balance-tracked so attribute
 * expressions like `onClick={() => x > 1}` don't confuse the scan — a
 * bare `>` only closes the tag when brace depth is back to 0.
 */
function findTagEnd(src: string, i: number): number {
  let j = i + 1;
  let braceDepth = 0;
  while (j < src.length) {
    const ch = src[j];
    if (ch === '"' || ch === "'" || ch === "`") {
      j = skipString(src, j, ch);
      continue;
    }
    if (ch === "{") {
      braceDepth++;
      j++;
      continue;
    }
    if (ch === "}") {
      braceDepth--;
      j++;
      continue;
    }
    if (braceDepth === 0 && ch === ">") return j;
    j++;
  }
  return -1;
}

/**
 * Scan a single balanced top-level expression starting at `start` (which
 * must point at `(`, `{`, `[`, or `<`). Returns the index just past the
 * matching close, or -1 if the scan runs off the end unresolved.
 *
 * Treats `()[]{}` as ordinary bracket pairs and JSX tags (`<Foo>...</Foo>`,
 * `<Foo />`, fragments `<>...</>`) as their own bracket pair via a single
 * shared depth counter — everything must return to depth 0 together.
 */
function scanBalancedExpression(src: string, start: number): number {
  let i = start;
  let depth = 0;
  let started = false;
  const n = src.length;

  while (i < n) {
    const ch = src[i];

    if (ch === '"' || ch === "'" || ch === "`") {
      i = skipString(src, i, ch);
      continue;
    }
    if (ch === "/" && src[i + 1] === "/") {
      const nl = src.indexOf("\n", i);
      if (nl === -1) return -1;
      i = nl;
      continue;
    }
    if (ch === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      if (end === -1) return -1;
      i = end + 2;
      continue;
    }

    if (ch === "(" || ch === "{" || ch === "[") {
      depth++;
      started = true;
      i++;
      continue;
    }
    if (ch === ")" || ch === "}" || ch === "]") {
      depth--;
      i++;
      if (depth < 0) return -1;
      if (started && depth === 0) return i;
      continue;
    }

    if (ch === "<") {
      if (src[i + 1] === "/") {
        // Closing tag `</Foo>` or fragment close `</>`.
        const close = src.indexOf(">", i);
        if (close === -1) return -1;
        depth--;
        started = true;
        i = close + 1;
        if (depth < 0) return -1;
        if (depth === 0) return i;
        continue;
      }
      const tagEnd = findTagEnd(src, i);
      if (tagEnd === -1) return -1;
      const selfClosing = src[tagEnd - 1] === "/";
      started = true;
      if (!selfClosing) depth++;
      i = tagEnd + 1;
      if (depth === 0) return i;
      continue;
    }

    i++;
  }
  return -1;
}

/** Strip the common leading whitespace from every non-blank line. */
function dedent(code: string): string {
  const lines = code.split("\n");
  if (lines.length <= 1) return code.trim();
  const indents = lines
    .filter((l) => l.trim().length > 0)
    .map((l) => l.match(/^(\s*)/)?.[1]?.length ?? 0);
  const min = indents.length ? Math.min(...indents) : 0;
  return lines
    .map((l) => (l.trim().length ? l.slice(min) : ""))
    .join("\n")
    .trim();
}

/**
 * Extract the JSX passed to `render: () => (...)` for the demo named
 * `demoName` inside `fileSource` (the raw text of a `*.showcase.tsx` file).
 * Returns clean, dedented, copy-pasteable JSX, or `null` if it can't be
 * confidently extracted.
 */
export function extractDemoSource(fileSource: string, demoName: string): string | null {
  try {
    const nameRe = new RegExp(`name:\\s*(["'\`])${escapeRegExp(demoName)}\\1`);
    const nameMatch = nameRe.exec(fileSource);
    if (!nameMatch) return null;

    const renderIdx = fileSource.indexOf("render:", nameMatch.index);
    if (renderIdx === -1) return null;

    const arrowRe = /render:\s*\(\)\s*=>\s*/y;
    arrowRe.lastIndex = renderIdx;
    const arrowMatch = arrowRe.exec(fileSource);
    if (!arrowMatch) return null;

    let start = arrowRe.lastIndex;
    while (start < fileSource.length && /\s/.test(fileSource[start])) start++;

    const first = fileSource[start];
    if (first !== "(" && first !== "<") return null;

    const end = scanBalancedExpression(fileSource, start);
    if (end === -1) return null;

    let raw = fileSource.slice(start, end);
    if (first === "(") raw = raw.slice(1, -1);

    const cleaned = dedent(raw);
    return cleaned.length > 0 ? cleaned : null;
  } catch {
    return null;
  }
}
