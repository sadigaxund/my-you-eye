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
 *
 * TODO.md Phase E extends invariants 1 and 3 to `src/scenes/**`: a scene is
 * also a pure function of the timeline (it reads `useProgress()`/
 * `useTimeline()` from `src/motion/core`, never a clock directly), and it
 * must stay remotion-free the same way `src/motion/`'s default entry does —
 * `VideoRoot` (Phase G) supplies the Remotion driver via `MotionRoot`, so a
 * consumer who only wants the live presenter never pulls a video renderer
 * into their bundle. Invariant 2 (the `src/ui/**` <-> motion import
 * boundary) does NOT extend to scenes: `src/scenes/**` is explicitly allowed
 * to import both `src/ui/**` and `src/motion/**` (TODO.md D1) — it's the
 * wiring tier where a static component meets a timeline.
 *
 * TODO.md Phase F extends invariants 1 and 3 again to `src/present/**`, with
 * one narrowly-scoped exception: `speaker-view/SpeakerView.useElapsed.ts`'s
 * elapsed-time timer is genuine wall-clock UI chrome (how long the speaker
 * has been talking), never part of any rendered scene/frame, so it is the
 * one named file in the whole repo outside `src/motion/core/` allowed to use
 * `Date.now()`/`setInterval()`. Every other file in `src/present/` is held
 * to the same rule as `src/motion/`'s default entry and `src/scenes/**`. In
 * addition, Phase F's tier table says nothing in `src/ui/`, `src/motion/` or
 * `src/scenes/` may import `src/present/` (present sits on top of all
 * three) — enforced below alongside the existing ui<->motion boundary.
 *
 * TODO.md Phase G adds a fifth tier, `src/video/` (VideoRoot — the module
 * that actually assembles a `Video` into a Remotion `<TransitionSeries>`),
 * which is NOT walked by this script the way the other four are: it is
 * expected to import `remotion`/`@remotion/transitions` freely, the same way
 * `src/motion/remotion.tsx` is the sole exception inside the motion tier.
 * What IS enforced below is the other direction — nothing in
 * `src/motion/`, `src/ui/`, `src/scenes/` or `src/present/`'s default entry
 * may import `src/video/` (mirrors the existing `PRESENT_IMPORT_RE` check).
 * Phase H then adds one narrowly-scoped exception inside `src/present/`
 * itself: `player.tsx` (`PlayerEmbed`, published separately as
 * `my-you-eye/present/player`) is allowed to import `remotion`-family
 * packages AND `src/video/` directly — embedding the exact video timeline in
 * a `<Player>` means rendering the exact same composition `VideoRoot`
 * assembles, and duplicating that assembly logic would be exactly the kind
 * of drift this whole guard exists to prevent.
 */

const ROOT = new URL("..", import.meta.url).pathname;
const MOTION_DIR = join(ROOT, "src/motion");
const UI_DIR = join(ROOT, "src/ui");
const SCENES_DIR = join(ROOT, "src/scenes");
const PRESENT_DIR = join(ROOT, "src/present");
const CORE_DIR = join(MOTION_DIR, "core");
const REMOTION_ENTRY = join(MOTION_DIR, "remotion.tsx");
// The ONE file allowed a wall-clock timer outside src/motion/core/ — see the
// docblock above and this file's own comment (TODO.md Phase F).
const PRESENT_TIMER_EXCEPTION = join(PRESENT_DIR, "speaker-view/SpeakerView.useElapsed.ts");
// The ONE file inside src/present/ allowed to import remotion/@remotion/* and
// src/video/ — see the docblock above (TODO.md Phase H).
const PLAYER_ENTRY = join(PRESENT_DIR, "player.tsx");
// Any relative import whose specifier reaches into src/present/.
const PRESENT_IMPORT_RE = /from\s+["'][^"']*\.\.\/present(?:\/|["'])/;
// Any relative import whose specifier reaches into src/video/.
const VIDEO_IMPORT_RE = /from\s+["'][^"']*\.\.\/video(?:\/|["'])/;

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

  if (PRESENT_IMPORT_RE.test(src)) {
    errors.push(`${rel}: imports from src/present/. src/present/ sits on top of src/motion/ — nothing below it may depend on it (TODO.md Phase F tier rules).`);
  }

  if (VIDEO_IMPORT_RE.test(src)) {
    errors.push(`${rel}: imports from src/video/. src/video/ sits on top of src/motion/ — nothing below it may depend on it (TODO.md Phase G tier rules).`);
  }
}

for (const file of walk(UI_DIR)) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, "utf-8");
  if (/from\s+["'][^"']*\.\.\/motion/.test(src) || /from\s+["']remotion["']|from\s+["']@remotion\//.test(src)) {
    errors.push(`${rel}: src/ui/ must not import the motion tier or remotion — AGENTS.md §9b.`);
  }
  if (PRESENT_IMPORT_RE.test(src)) {
    errors.push(`${rel}: imports from src/present/. src/present/ sits on top of src/ui/ — nothing below it may depend on it (TODO.md Phase F tier rules).`);
  }
  if (VIDEO_IMPORT_RE.test(src)) {
    errors.push(`${rel}: imports from src/video/. src/video/ sits on top of src/ui/ — nothing below it may depend on it (TODO.md Phase G tier rules).`);
  }
}

// src/scenes/** (TODO.md Phase E): same clock/CSS-animation ban and the same
// "must not import remotion" rule as src/motion/'s default entry — but NOT
// the ui-tier import ban, since scenes are explicitly allowed to import both
// src/ui/** and src/motion/** (TODO.md D1).
for (const file of walk(SCENES_DIR)) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, "utf-8");

  for (const [re, label] of CLOCK_PATTERNS) {
    if (re.test(src)) {
      errors.push(`${rel}: uses ${label}. Scenes must be pure functions of useProgress()/useTimeline() (src/motion/core) — AGENTS.md §9c rule 1, extended to src/scenes/ by TODO.md Phase E.`);
    }
  }

  for (const [re, label] of CSS_ANIM_PATTERNS) {
    if (re.test(src)) {
      errors.push(`${rel}: uses ${label}. Scenes must be frame-driven, not wall-clock — it will not render deterministically to MP4. AGENTS.md §9c rule 1.`);
    }
  }

  if (/from\s+["']remotion["']|from\s+["']@remotion\//.test(src)) {
    errors.push(`${rel}: imports remotion. Scenes must stay remotion-free — VideoRoot (Phase G) supplies the driver via MotionRoot from "my-you-eye/motion/remotion", so a consumer who only wants the live presenter never pulls a video renderer into their bundle (TODO.md D1).`);
  }

  if (PRESENT_IMPORT_RE.test(src)) {
    errors.push(`${rel}: imports from src/present/. Scenes must not depend on the present tier — the interactivity context scenes read (src/scenes/interaction.ts) is defined here precisely so this import is never needed (TODO.md D2/Phase F tier rules).`);
  }

  if (VIDEO_IMPORT_RE.test(src)) {
    errors.push(`${rel}: imports from src/video/. src/video/ sits on top of src/scenes/ — nothing below it may depend on it (TODO.md Phase G tier rules).`);
  }
}

// src/present/** (TODO.md Phase F): same clock/CSS-animation ban and the
// same "must not import remotion" rule as src/scenes/** — the Presenter's
// own DomDriver covers the live path. Two narrowly-scoped exceptions:
// PRESENT_TIMER_EXCEPTION (the speaker view's elapsed-time timer) is genuine
// wall-clock UI chrome, never part of a rendered scene/frame; PLAYER_ENTRY
// (`player.tsx`, TODO.md Phase H) is the `@remotion/player` path and is
// allowed to import remotion/@remotion/* AND src/video/ — see the docblock
// at the top of this file for why that's the one deliberate hole in the
// "present stays remotion-free" rule, and why it's `src/video/` not
// re-implemented in `src/present/` to get it.
for (const file of walk(PRESENT_DIR)) {
  const rel = relative(ROOT, file);
  const src = readFileSync(file, "utf-8");
  const isTimerException = file === PRESENT_TIMER_EXCEPTION;
  const isPlayerEntry = file === PLAYER_ENTRY;

  if (!isTimerException) {
    for (const [re, label] of CLOCK_PATTERNS) {
      if (re.test(src)) {
        errors.push(`${rel}: uses ${label}. src/present/ must not read wall-clock time outside the one documented exception (speaker-view/SpeakerView.useElapsed.ts) — TODO.md Phase F.`);
      }
    }
  }

  for (const [re, label] of CSS_ANIM_PATTERNS) {
    if (re.test(src)) {
      errors.push(`${rel}: uses ${label}. Presenter chrome must not rely on CSS transitions/keyframes for anything timeline-driven — TODO.md Phase F.`);
    }
  }

  if (!isPlayerEntry && /from\s+["']remotion["']|from\s+["']@remotion\//.test(src)) {
    errors.push(`${rel}: imports remotion. src/present/ must stay remotion-free outside the one documented exception (player.tsx, my-you-eye/present/player) — the Presenter's own DomDriver covers the live path (TODO.md Phase F/H).`);
  }

  if (!isPlayerEntry && VIDEO_IMPORT_RE.test(src)) {
    errors.push(`${rel}: imports from src/video/. Only player.tsx (my-you-eye/present/player) may — it is the one place the present tier legitimately needs the exact video composition (TODO.md Phase H).`);
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
