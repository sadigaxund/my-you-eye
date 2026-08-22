import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const TOKENS = join(ROOT, "src/styles/tokens.css");
const THEMES_DIR = join(ROOT, "src/styles/themes");

const tokensRaw = readFileSync(TOKENS, "utf-8").replace(/\/\*[\s\S]*?\*\//g, "");

// Extract all --* token names from the @theme block. Comments are stripped
// first: comment prose may mention token names ("--color-surface: some
// themes…") which would otherwise register phantom required tokens (or, in
// value-parsing siblings like check-contrast.mjs, poison real values).
const baseTokens = new Set();
let match;
const tokenPattern = /--([\w-]+):/g;
while ((match = tokenPattern.exec(tokensRaw)) !== null) {
  baseTokens.add(match[1]);
}

// Token categories we expect every theme to define. "color-" covers the full
// palette (including --color-canvas-surface, the opaque/blur-free boundary
// used inside Canvas — see AGENTS.md §7). "texture-" covers the paper-texture
// on/off switch (--texture-opacity, --texture-blend) so every theme must at
// least explicitly state its texture is off, rather than silently inheriting.
// --texture-paper/--texture-size are the shared raster asset + tile size —
// intentionally global, not themed, so they're excluded from the check.
const requiredPrefixes = ["color-", "texture-"];
// Individually required tokens outside those prefixes. --opacity-focus-dim
// (out-of-focus code lines in CodeBlock's focusRange) is listed here rather
// than by adding an "opacity-" prefix above: the other two opacity tokens
// (--opacity-dim, --opacity-muted) are legitimately optional — a theme that
// is happy with the base value simply inherits it — and promoting the whole
// prefix would retroactively demand them from four themes that never needed
// them. The focus dim is different: how hard a theme dims is a deliberate
// per-theme call (brutal dims at 0.5, everything else at 0.25), so a theme
// that never states its value has forgotten to make that call.
const requiredTokens = ["opacity-focus-dim"];
// DERIVED CATEGORY (TODO.md D3 / AGENTS.md §0.9 approved exception, Batch 4):
// the chart palette (--color-chart-1..8 categorical, --color-chart-seq-1..5
// sequential) is computed ONCE in tokens.css from each theme's own
// --color-primary via CSS relative-color syntax (oklch(from var(--color-primary) ...)).
// Requiring every theme to redefine 13 more color tokens is exactly the
// maintenance trap D3 exists to avoid — themes inherit a coherent, validated
// chart palette for free. A theme MAY still override individual chart-*
// tokens (a few do, to dodge a CVD collision the general formula hits at
// that theme's specific primary hue — see the chart-token comment in
// tokens.css) but is never REQUIRED to, so these stay out of the coverage
// check the same way texture-paper/texture-size already do above.
const excludedTokens = new Set([
  "texture-paper",
  "texture-size",
  "color-chart-1", "color-chart-2", "color-chart-3", "color-chart-4",
  "color-chart-5", "color-chart-6", "color-chart-7", "color-chart-8",
  "color-chart-seq-1", "color-chart-seq-2", "color-chart-seq-3",
  "color-chart-seq-4", "color-chart-seq-5",
]);

let errors = [];

if (!existsSync(THEMES_DIR)) {
  console.error("❌ Themes directory not found:", THEMES_DIR);
  process.exit(1);
}

const themeFiles = readdirSync(THEMES_DIR).filter((f) => f.endsWith(".css"));

if (themeFiles.length === 0) {
  console.error("❌ No theme files found in", THEMES_DIR);
  process.exit(1);
}

for (const file of themeFiles) {
  const content = readFileSync(join(THEMES_DIR, file), "utf-8").replace(/\/\*[\s\S]*?\*\//g, "");
  const themeTokens = new Set();
  let m;
  const re = /--([\w-]+):/g;
  while ((m = re.exec(content)) !== null) {
    themeTokens.add(m[1]);
  }

  for (const prefix of requiredPrefixes) {
    for (const token of baseTokens) {
      if (!token.startsWith(prefix)) continue;
      if (excludedTokens.has(token)) continue;
      if (!themeTokens.has(token)) {
        errors.push(`${file}: missing --${token}`);
      }
    }
  }

  for (const token of requiredTokens) {
    if (!baseTokens.has(token)) {
      errors.push(`src/styles/tokens.css: missing --${token} (required by check-themes.mjs)`);
      continue;
    }
    if (!themeTokens.has(token)) errors.push(`${file}: missing --${token}`);
  }
}

if (errors.length > 0) {
  console.error("❌ Theme token check failed:\n");
  for (const err of errors) {
    console.error(`  • ${err}`);
  }
  process.exit(1);
}

console.log("✅ All themes define the required token set");
process.exit(0);
