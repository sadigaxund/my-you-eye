import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * Motion tier guard (AGENTS.md §9b/§9c, TODO.md D1/D2).
 *
 * Three invariants, each of which has already been violated once by hand:
 *
 * 1. Only `src/motion/core/` may touch a clock. Primitives are pure functions
 *    of `useProgress()` — a stray `useCurrentFrame()`, `Date.now()` or
 *    `setTimeout` makes them render non-deterministically, which silently
 *    corrupts MP4 output frame-by-frame rather than failing loudly.
 * 2. `src/ui/**` may never import the motion tier, and the motion tier may
 *    never import `src/ui/**`. eslint enforces the import direction; this
 *    also catches it if someone edits the eslint config.
 * 3. The default `my-you-eye/motion` entry must not reach `remotion`, so a
 *    plain-UI consumer never pulls a video renderer into their bundle. Only
 *    `src/motion/remotion.tsx` is allowed to import it.
 */

const ROOT = new URL("..", import.meta.url).pathname;
const MOTION_DIR = join(ROOT, "src/motion");
const UI_DIR = join(ROOT, "src/ui");
const CORE_DIR = join(MOTION_DIR, "core");
const REMOTION_ENTRY = join(MOTION_DIR, "remotion.tsx");

const errors = [];

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(full)) acc.push(full);
  }
  return acc;
}

// Wall-clock / frame APIs that break determinism outside the driver layer.
const CLOCK_PATTERNS = [
  [/\buseCurrentFrame\s*\(/, "useCurrentFrame()"],
  [/\bDate\.now\s*\(/, "Date.now()"],
  [/\bperformance\.now\s*\(/, "performance.now()"],
  [/\bsetTimeout\s*\(/, "setTimeout()"],
  [/\bsetInterval\s*\(/, "setInterval()"],
  [/\brequestAnimationFrame\s*\(/, "requestAnimationFrame()"],
  [/\bMath\.random\s*\(/, "Math.random() (use the seeded PRNG in core/prng.ts)"],
];

// CSS-driven animation never renders deterministically under frame capture.
const CSS_ANIM_PATTERNS = [
  [/\btransition(?:Property|Duration|Delay)?\s*:/, "a CSS transition"],
  [/@keyframes\b/, "@keyframes"],
  [/\banimation\s*:/, "a CSS animation shorthand"],
];

for (const file of walk(MOTION_DIR)) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, "utf-8");
  const inCore = file.startsWith(CORE_DIR);
  const isRemotionEntry = file === REMOTION_ENTRY;

  // The driver layer is precisely the code allowed to touch a clock: core/
  // holds DomDriver's rAF loop, and remotion.tsx IS RemotionDriver, whose
  // whole job is to call useCurrentFrame() at its own top level so that no
  // primitive ever has to.
  if (!inCore && !isRemotionEntry) {
    for (const [re, label] of CLOCK_PATTERNS) {
      if (re.test(src)) {
        errors.push(`${rel}: uses ${label} outside src/motion/core/. Primitives must be pure functions of useProgress() — AGENTS.md §9c rule 1.`);
      }
    }
  }

  for (const [re, label] of CSS_ANIM_PATTERNS) {
    if (re.test(src)) {
      errors.push(`${rel}: uses ${label}. Motion must be frame-driven, not wall-clock — it will not render deterministically to MP4. AGENTS.md §9c rule 1.`);
    }
  }

  if (/from\s+["'](?:[./]*\/)?ui\//.test(src) || /from\s+["'][^"']*\.\.\/ui/.test(src) || /from\s+["']my-you-eye["']/.test(src)) {
    errors.push(`${rel}: imports from src/ui/ or "my-you-eye". The motion tier must stay child-agnostic — AGENTS.md §9b/§9c rule 3.`);
  }

  if (!isRemotionEntry && /from\s+["']remotion["']|from\s+["']@remotion\//.test(src)) {
    errors.push(`${rel}: imports remotion. Only src/motion/remotion.tsx may — it is what keeps "my-you-eye/motion" free of a video renderer (TODO.md D1).`);
  }
}

for (const file of walk(UI_DIR)) {
  const src = readFileSync(file, "utf-8");
  if (/from\s+["'][^"']*\.\.\/motion/.test(src) || /from\s+["']remotion["']|from\s+["']@remotion\//.test(src)) {
    errors.push(`${relative(ROOT, file)}: src/ui/ must not import the motion tier or remotion — AGENTS.md §9b.`);
  }
}

// Every primitive folder must be reachable from the public entry, or it ships
// as dead code that no consumer can reach and no showcase can catch.
const indexPath = join(MOTION_DIR, "index.ts");
if (existsSync(indexPath)) {
  const index = readFileSync(indexPath, "utf-8");
  for (const entry of readdirSync(MOTION_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === "core") continue;
    const dir = join(MOTION_DIR, entry.name);
    const hasComponent = readdirSync(dir).some((f) => f.endsWith(".tsx") && !f.endsWith(".showcase.tsx"));
    if (hasComponent && !index.includes(`./${entry.name}`)) {
      errors.push(`src/motion/${entry.name}/ is not exported from src/motion/index.ts.`);
    }
  }
}

if (!existsSync(MOTION_DIR) || !statSync(MOTION_DIR).isDirectory()) {
  console.log("ℹ️  No src/motion/ yet — motion checks skipped.");
  process.exit(0);
}

if (errors.length > 0) {
  console.error("❌ Motion tier check failed:\n");
  for (const err of errors) console.error(`  • ${err}`);
  process.exit(1);
}

console.log("✅ Motion tier clean (no wall-clock APIs, no tier violations, remotion isolated)");
process.exit(0);
