// Fails the build on a Tailwind utility that the build did not actually emit.
//
// Why this exists: that failure mode is invisible to everything else in
// `validate`. `bg-info/70` is a perfectly well-formed string — tsc has no
// opinion about it, eslint has no opinion about it, and Tailwind, which only
// emits rules for utilities it can resolve, silently emits NOTHING. The
// element renders unstyled with no error anywhere. Two bugs of exactly this
// shape shipped in one session (Timeline's span bars used `bg-info/70`, and
// there is no `--color-info` token — StatusDot's own `info` variant resolves
// to `bg-primary`), and both were found only by a human looking at a
// screenshot.
//
// The check is deliberately NOT a hand-maintained model of Tailwind's
// namespace. An earlier attempt enumerated colour prefixes and built-in
// palettes and immediately produced ~40 false positives on `text-base`,
// `border-t`, `ring-offset-2` and CSS property names inside arbitrary-value
// brackets. A guard that cries wolf gets switched off, which costs more than
// it saves.
//
// Instead: Tailwind scans `src/` for class names and emits a rule for each one
// it can resolve. So a literal class in the source that has NO corresponding
// rule in the built stylesheet is, by construction, one Tailwind rejected.
// That needs no knowledge of Tailwind's namespace, covers every utility family
// rather than just colours, and cannot drift as Tailwind changes.
//
// Requires the CSS bundle to exist — run after `vite build`. That's why it
// sits after the build steps in `validate` rather than at the front with the
// other static checks.

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");
const ASSETS = join(ROOT, "dist/assets");

function findBundledCss() {
  if (!existsSync(ASSETS)) return null;
  const css = readdirSync(ASSETS).filter((f) => f.endsWith(".css"));
  if (css.length === 0) return null;
  return css.map((f) => readFileSync(join(ASSETS, f), "utf-8")).join("\n");
}

const bundled = findBundledCss();
if (!bundled) {
  console.log("⏭️  check-tokens: no built CSS in dist/assets — run after `vite build`. Skipping.");
  process.exit(0);
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if ([".ts", ".tsx"].includes(extname(entry))) out.push(full);
  }
  return out;
}

/**
 * Utilities worth checking: a known colour-bearing prefix followed by a bare
 * word value, optionally with variants and an opacity modifier. Restricted to
 * colour prefixes ON PURPOSE — those are the ones whose failure is silent and
 * total (no background at all), whereas a bad spacing utility is usually
 * obvious the moment you look. Arbitrary values (`bg-[...]`) are excluded:
 * they bypass the token system entirely and are already covered by AGENTS.md's
 * own rules.
 */
const PREFIXES = ["bg", "text", "border", "ring", "fill", "stroke", "divide", "outline", "accent", "caret", "shadow", "from", "via", "to"];
const utilityRe = new RegExp(
  String.raw`(?<![\w-])((?:[a-z-]+:)*)(${PREFIXES.join("|")})-([a-z][a-z0-9]*(?:-[a-z0-9]+)*)(\/\d{1,3})?(?![\w[/-])`,
  "g",
);

/**
 * Whether the build emitted a rule for this exact utility. The selector must
 * END at a class-name boundary — a bare `includes(".so")` also matches
 * `.sort`, which was enough to make English prose look like a class list.
 * Tailwind escapes `:` and `/` in emitted selectors (`.hover\:bg-x\/70`), so
 * both the plain and the escaped-variant forms are accepted.
 */
const emittedCache = new Map();
function emitted(base) {
  const hit = emittedCache.get(base);
  if (hit !== undefined) return hit;
  const esc = base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(String.raw`[.\\:]` + esc + String.raw`(?![\w-])`);
  const result = re.test(bundled);
  emittedCache.set(base, result);
  return result;
}

/**
 * A string literal is treated as a CLASS LIST only when at least one of its
 * whitespace-separated words is a utility the build actually emitted. That
 * self-calibrating test is what removes the last of the false positives
 * without hand-maintaining an exclusion list: `"from-right"` (a transition
 * direction), `"border-radius"` (inside a code sample) and `"text-metrics"`
 * (an export name) have no emitted sibling and are skipped, while
 * `"h-1.5 rounded-full bg-info/70"` plainly is a class list and its one
 * unresolvable word is reported.
 *
 * The cost is that a one-word className with a broken utility slips through.
 * That is the right trade: this guard's whole value is being trustworthy
 * enough to stay switched on.
 */
function isClassList(literal) {
  // Prose and code samples are excluded by shape: a class list has no
  // sentence punctuation, no capitals and no parentheses.
  if (/[A-Z(),;=]/.test(literal)) return false;
  const words = literal.split(/\s+/).filter(Boolean);
  if (words.length === 0) return false;

  // A SINGLE-word literal is the shape a `Record<Variant, string>` map uses —
  // `active: "bg-primary/70"` — and that is precisely the shape the original
  // bug took, so it cannot be skipped. It's accepted when the whole literal is
  // one utility on a prefix whose values are always tokens. `from`/`via`/`to`
  // are excluded here and only checked inside multi-word lists: on their own
  // they collide with ordinary data ("from-right" is a transition direction,
  // not a gradient stop).
  if (words.length === 1) return SINGLE_WORD_RE.test(words[0]);

  return words.some((w) => {
    const bare = w.replace(/^(?:[a-z-]+:)*/, "").replace(/\/\d{1,3}$/, "");
    return bare.length > 1 && emitted(bare);
  });
}

/** Prefixes safe to check on a lone literal — see `isClassList`. */
const SINGLE_WORD_RE = new RegExp(
  String.raw`^(?:[a-z-]+:)*(?:bg|text|border|ring|fill|stroke|divide|outline|accent|caret|shadow)-[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:\/\d{1,3})?$`,
);

const failures = [];
const seen = new Set();
for (const file of walk(SRC)) {
  // Comments and arbitrary-value brackets are stripped first. Both are full
  // of things shaped exactly like a utility that aren't one: CSS property
  // names (`stroke-dasharray`, `border-radius`), identifiers (`text-metrics`,
  // `from-left`), and — pointedly — prose ABOUT a broken utility. The comment
  // in Timeline.lanes.tsx explaining the `bg-info` bug was itself reported as
  // a `bg-info` bug before this line existed.
  const source = readFileSync(file, "utf-8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\[[^\]]*\]/g, "[]");

  const lines = source.split("\n");
  lines.forEach((line, i) => {
    for (const lit of line.matchAll(/["'`]([^"'`\n]*)["'`]/g)) {
      const literal = lit[1];
      // A literal assigned to a camelCase object key is a CSS-in-JS VALUE,
      // not a class list — `verticalAlign: "text-bottom"` is valid CSS and
      // has nothing to do with Tailwind. Variant maps key on plain lowercase
      // names (`active:`, `done:`), so the two never collide. `className` is
      // the one camelCase key that really does hold classes.
      const before = line.slice(0, lit.index);
      if (/\b([a-z]+[A-Z]\w*)\s*:\s*$/.test(before) && !/\bclassName\s*:\s*$/.test(before)) continue;
      if (!isClassList(literal)) continue;
      for (const m of literal.matchAll(utilityRe)) {
        const [, , prefix, value] = m;
        const base = `${prefix}-${value}`;
        const key = `${file}:${base}`;
        if (seen.has(key)) continue;
        seen.add(key);
        if (emitted(base)) continue;
        failures.push({ file: file.replace(ROOT, ""), line: i + 1, utility: base });
      }
    }
  });
}

if (failures.length > 0) {
  console.error("❌ Utilities used in source that Tailwind emitted no rule for:\n");
  for (const f of failures) console.error(`   ${f.file}:${f.line}  ${f.utility}`);
  console.error("\nTailwind resolves nothing for these, so the element renders unstyled");
  console.error("with no error at build time and no error at runtime. Either the token");
  console.error("doesn't exist (add it to src/styles/tokens.css) or the name is wrong.");
  process.exit(1);
}

console.log("✅ Every colour utility in src/ resolves to a rule in the built CSS");
