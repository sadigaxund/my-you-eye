// Verifies WCAG AA contrast (>=4.5:1) for critical fg/bg token pairs, in every
// theme, in both light and dark mode. See AGENTS.md §7 (Theme / Profile contract).
//
// Cascade model (mirrors globals.css import order + CSS specificity):
//   - "default" theme: base tokens.css, dark mode = base overridden by dark.css .dark{}
//   - named theme (own file under src/styles/themes/, e.g. glass.css): its own
//     `[data-theme="X"]` block is a COMPLETE redefinition (enforced by
//     check-themes.mjs) that outranks tokens.css/dark.css by source order at
//     equal specificity; its `[data-theme="X"].dark` block only overrides the
//     deltas for dark mode, falling back to its own light block (NOT tokens.css
//     or dark.css) for anything it doesn't redefine.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const TOKENS = join(ROOT, "src/styles/tokens.css");
const THEMES_DIR = join(ROOT, "src/styles/themes");

function parseBlock(css, selectorRegex) {
  // Strip /* */ comments FIRST: comment prose may legitimately mention token
  // names ("--color-fg: fg is themed…", "--color-surface: some themes…"),
  // and the naive definition regex below would otherwise match inside the
  // comment, swallow following real definitions into a garbage value, or
  // overwrite an earlier correct one (surfaced by #27's var()-alias pairs).
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  // selectorRegex must be a `g`-flagged regex; merges every matching block
  // (a selector may appear more than once, e.g. an `html[data-theme]` block
  // with only background rules, plus a bare `[data-theme]` block with tokens).
  const tokens = {};
  let m;
  while ((m = selectorRegex.exec(clean)) !== null) {
    const body = m[1];
    const re = /--([\w-]+):\s*([^;]+);/g;
    let mm;
    while ((mm = re.exec(body)) !== null) {
      tokens[mm[1]] = mm[2].trim();
    }
  }
  return tokens;
}

function parseNamedThemeBlocks(css, name) {
  // light block: `[data-theme="name"]` not immediately followed by `.dark`
  const light = parseBlock(
    css,
    new RegExp(`(?:html)?\\[data-theme=["']${name}["']\\]\\s*(?!\\.dark)\\{([^}]*)\\}`, "g"),
  );
  const dark = parseBlock(
    css,
    new RegExp(`\\[data-theme=["']${name}["']\\]\\.dark\\s*\\{([^}]*)\\}`, "g"),
  );
  return { light, dark };
}

const tokensCss = readFileSync(TOKENS, "utf-8");
const baseTokens = parseBlock(tokensCss, /@theme\s*\{([\s\S]*)\}/g);

const darkCssPath = join(THEMES_DIR, "dark.css");
const darkCss = readFileSync(darkCssPath, "utf-8");
const darkCssTokens = parseBlock(darkCss, /\.dark\s*\{([^}]*)\}/g);

const themeFiles = readdirSync(THEMES_DIR)
  .filter((f) => f.endsWith(".css") && f !== "dark.css")
  .map((f) => f.replace(/\.css$/, ""));

const themes = [{ name: "default" }, ...themeFiles.map((name) => ({ name }))];

// --- OKLCH -> relative luminance ---------------------------------------
function parseOklch(value) {
  const m = /oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/.exec(value);
  if (!m) return null;
  let L = parseFloat(m[1]);
  if (value.includes(`${m[1]}%`)) L = L / 100;
  const C = parseFloat(m[2]);
  const H = parseFloat(m[3]);
  const A = m[4] !== undefined ? parseFloat(m[4]) : 1;
  return { L, C, H, A };
}

function oklchToLinearSrgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return [r, g, bl];
}

function relativeLuminance(value) {
  const parsed = parseOklch(value);
  if (!parsed) return null;
  const [r, g, b] = oklchToLinearSrgb(parsed.L, parsed.C, parsed.H).map((v) =>
    Math.min(1, Math.max(0, v)),
  );
  return { lum: 0.2126 * r + 0.7152 * g + 0.0722 * b, alpha: parsed.A };
}

// Returns { ratio } on success, or { error } describing why no honest ratio
// can be produced. Alpha is a hard error rather than a silent approximation:
// the WCAG formula is defined on composited colours, and this script has no
// model of what a translucent token would actually be composited over (it
// varies per component, per theme, and per stacking context). Treating
// `oklch(... / 0.6)` as opaque would report a ratio the user never sees, so a
// checked pair carrying alpha must be either made opaque or removed from
// PAIRS — never quietly rounded up to 1.
function contrastRatio(fgValue, bgValue) {
  const fg = relativeLuminance(fgValue);
  const bg = relativeLuminance(bgValue);
  if (!fg || !bg) return { error: "could not parse oklch" };
  for (const [role, parsed, raw] of [["fg", fg, fgValue], ["bg", bg, bgValue]]) {
    if (parsed.alpha < 1) {
      return {
        error: `${role} token is translucent (alpha ${parsed.alpha}) — contrast is undefined without knowing what it composites over. Make it opaque, or drop the pair from PAIRS. (${raw})`,
      };
    }
  }
  const l1 = Math.max(fg.lum, bg.lum);
  const l2 = Math.min(fg.lum, bg.lum);
  return { ratio: (l1 + 0.05) / (l2 + 0.05) };
}

// --- Build effective token maps per theme/mode --------------------------
function effectiveTokens(theme, mode) {
  if (theme.name === "default") {
    return mode === "light" ? { ...baseTokens } : { ...baseTokens, ...darkCssTokens };
  }
  const css = readFileSync(join(THEMES_DIR, `${theme.name}.css`), "utf-8");
  const { light, dark } = parseNamedThemeBlocks(css, theme.name);
  const lightTokens = { ...baseTokens, ...light };
  return mode === "light" ? lightTokens : { ...lightTokens, ...dark };
}

const PAIRS = [
  ["fg", "bg"],
  ["muted", "bg"],
  ["primary-fg", "primary"],
  ["danger-fg", "danger"],
  ["success-fg", "success"],
  ["secondary-fg", "secondary"],
  // Sidebar chrome family (#27): panel text must read on the resting panel,
  // on a hovered row, and on an active row; badge counts on their accent chip.
  // This is why glass/frosted define OPAQUE sidebar item-hover/active tokens
  // while their generic surface family stays translucent.
  ["sidebar-fg", "sidebar"],
  ["sidebar-fg", "sidebar-item-hover"],
  ["sidebar-fg", "sidebar-item-active"],
  ["sidebar-badge-fg", "sidebar-badge"],
  ["warning-fg", "warning"],
  // Panel-surface legibility (#master hardening): checked against the OPAQUE
  // surface companion — glass/frosted's --color-surface is deliberately
  // translucent, and contrast on a translucent color is undefined.
  ["fg", "surface-opaque"],
  ["muted", "surface-opaque"],
];

// Base tokens.css may define a color as a var() alias of another token
// (e.g. --color-sidebar: var(--color-surface-opaque), #27). Resolve such
// chains against the theme's own effective map so derived pairs are checked
// at their real resolved values; a named theme's explicit overrides win
// because they live in the same map.
function resolveToken(value, tokens, depth = 0) {
  if (depth > 8) return value;
  const m = /^var\(\s*--([\w-]+)\s*\)$/.exec(value.trim());
  if (!m) return value;
  const next = tokens[m[1]];
  return next ? resolveToken(next, tokens, depth + 1) : value;
}

const MIN_RATIO = 4.5;
let failures = [];

for (const theme of themes) {
  for (const mode of ["light", "dark"]) {
    const tokens = effectiveTokens(theme, mode);
    for (const [fgKey, bgKey] of PAIRS) {
      const fgVal = resolveToken(tokens[`color-${fgKey}`], tokens);
      const bgVal = resolveToken(tokens[`color-${bgKey}`], tokens);
      if (!fgVal || !bgVal) {
        failures.push(
          `${theme.name} (${mode}): missing token for pair color-${fgKey}/color-${bgKey}`,
        );
        continue;
      }
      const { ratio, error } = contrastRatio(fgVal, bgVal);
      if (error) {
        failures.push(
          `${theme.name} (${mode}): color-${fgKey}/color-${bgKey} — ${error}`,
        );
        continue;
      }
      if (ratio < MIN_RATIO) {
        failures.push(
          `${theme.name} (${mode}): color-${fgKey}/color-${bgKey} contrast ${ratio.toFixed(2)}:1 < ${MIN_RATIO}:1  (fg=${fgVal} bg=${bgVal})`,
        );
      }
    }
  }
}

// --- Class-level cross-wire guard ---------------------------------------
// The danger/primary-fg bug (AGENTS.md §7 audit) was invisible to the PAIRS
// check above because that check only verifies *declared* token pairs, not
// the classes a component actually renders (e.g. `bg-danger text-primary-fg`
// — both tokens individually fine, the pairing wrong). This scans src/ui for
// a `bg-<sem>` and a `text-<sem2>-fg` (or `text-bg`/`text-fg`) co-occurring
// inside the SAME quoted class string, and fails if that literal pairing
// doesn't hit MIN_RATIO in every theme/mode.
// NOTE(human): this is a narrow heuristic, not a general class-list resolver.
// It only catches tokens written together in one string literal, grouped by
// their Tailwind modifier prefix (e.g. `data-[state=checked]:`, `hover:`) so
// a base `bg-bg` isn't wrongly paired with an unrelated
// `data-[state=checked]:text-primary-fg` a few tokens later — same string,
// different rendered state. It does NOT join classes split across separate
// array elements (e.g. cva's `["text-secondary-fg", "bg-secondary/60"]`) or
// across separate `cn()`/template arguments — doing that generally needs
// real JSX/class-list parsing, out of scope here.
const SEM = "fg|bg|primary|secondary|danger|success|warning|surface";
const bgRe = new RegExp(`^bg-(${SEM})$`);
const fgRe = new RegExp(`^text-(bg|fg|primary-fg|secondary-fg|danger-fg|success-fg|warning-fg)$`);
const stringLitRe = /"[^"\n]*"|'[^'\n]*'|`[^`]*`/g;
const uiFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (entry.name.endsWith(".tsx") && !entry.name.endsWith(".showcase.tsx")) uiFiles.push(p);
  }
})(join(ROOT, "src/ui"));

for (const file of uiFiles) {
  const content = readFileSync(file, "utf-8");
  let m;
  while ((m = stringLitRe.exec(content)) !== null) {
    const classTokens = m[0].slice(1, -1).split(/\s+/).filter(Boolean);
    const groups = new Map(); // modifier prefix -> { bg, fg }
    for (const tok of classTokens) {
      const lastColon = tok.lastIndexOf(":");
      const prefix = lastColon === -1 ? "" : tok.slice(0, lastColon + 1);
      const utility = (lastColon === -1 ? tok : tok.slice(lastColon + 1)).replace(/\/\d+$/, "");
      const bgMatch = bgRe.exec(utility);
      const fgMatch = fgRe.exec(utility);
      if (!bgMatch && !fgMatch) continue;
      const g = groups.get(prefix) ?? {};
      if (bgMatch) g.bg = bgMatch[1];
      if (fgMatch) g.fg = fgMatch[1];
      groups.set(prefix, g);
    }
    for (const { bg, fg } of groups.values()) {
      if (!bg || !fg) continue;
      if (fg.replace(/-fg$/, "") === bg) continue; // correctly-paired, already covered by PAIRS
      for (const theme of themes) {
        for (const mode of ["light", "dark"]) {
          const tokens = effectiveTokens(theme, mode);
          const fgVal = tokens[`color-${fg}`];
          const bgVal = tokens[`color-${bg}`];
          if (!fgVal || !bgVal) continue;
          const ratio = contrastRatio(fgVal, bgVal);
          if (ratio !== null && ratio < MIN_RATIO) {
            failures.push(
              `${file.replace(ROOT, "")}: rendered class "bg-${bg} text-${fg}" — ${theme.name} (${mode}) contrast ${ratio.toFixed(2)}:1 < ${MIN_RATIO}:1`,
            );
          }
        }
      }
    }
  }
}

if (failures.length > 0) {
  console.error("❌ Contrast check failed:\n");
  for (const f of failures) console.error(`  • ${f}`);
  process.exit(1);
}

console.log(`✅ All ${themes.length} themes pass WCAG AA (>=${MIN_RATIO}:1) for all checked pairs, light and dark`);
process.exit(0);
