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
  // selectorRegex must be a `g`-flagged regex; merges every matching block
  // (a selector may appear more than once, e.g. an `html[data-theme]` block
  // with only background rules, plus a bare `[data-theme]` block with tokens).
  const tokens = {};
  let m;
  while ((m = selectorRegex.exec(css)) !== null) {
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

function contrastRatio(fgValue, bgValue) {
  const fg = relativeLuminance(fgValue);
  const bg = relativeLuminance(bgValue);
  if (!fg || !bg) return null;
  const l1 = Math.max(fg.lum, bg.lum);
  const l2 = Math.min(fg.lum, bg.lum);
  return (l1 + 0.05) / (l2 + 0.05);
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
];

const MIN_RATIO = 4.5;
let failures = [];

for (const theme of themes) {
  for (const mode of ["light", "dark"]) {
    const tokens = effectiveTokens(theme, mode);
    for (const [fgKey, bgKey] of PAIRS) {
      const fgVal = tokens[`color-${fgKey}`];
      const bgVal = tokens[`color-${bgKey}`];
      if (!fgVal || !bgVal) {
        failures.push(
          `${theme.name} (${mode}): missing token for pair color-${fgKey}/color-${bgKey}`,
        );
        continue;
      }
      const ratio = contrastRatio(fgVal, bgVal);
      if (ratio === null) {
        failures.push(
          `${theme.name} (${mode}): could not parse oklch for color-${fgKey}/color-${bgKey}`,
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

if (failures.length > 0) {
  console.error("❌ Contrast check failed:\n");
  for (const f of failures) console.error(`  • ${f}`);
  process.exit(1);
}

console.log(`✅ All ${themes.length} themes pass WCAG AA (>=${MIN_RATIO}:1) for all checked pairs, light and dark`);
process.exit(0);
