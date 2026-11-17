import { copyFileSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const STYLES_DIR = join(ROOT, "src/styles");
const DIST_DIR = join(ROOT, "dist");

function fail(msg) {
  console.error(`copy-styles: ${msg}`);
  process.exit(1);
}

// dist/styles.css is a transformed COPY of globals.css (src stays untouched: the
// in-repo showcase uses it with absolute /fonts/ urls and scans src/ itself).
//  1. #44: Tailwind v4 skips node_modules when auto-detecting sources, so the
//     published stylesheet must point at the shipped JS bundles (all at dist root,
//     next to this file) with an explicit @source, or consumers get no utilities.
const TW_IMPORT = '@import "tailwindcss";';
let css = readFileSync(join(STYLES_DIR, "globals.css"), "utf8");
if (!css.includes(TW_IMPORT)) fail(`anchor ${TW_IMPORT} not found in globals.css`);
css = css.replace(TW_IMPORT, `${TW_IMPORT}\n@source "./*.js";`);
writeFileSync(join(DIST_DIR, "styles.css"), css);

const themesDist = join(DIST_DIR, "themes");
if (!existsSync(themesDist)) mkdirSync(themesDist, { recursive: true });

for (const name of [
  "dark.css", "neon.css", "contrast.css", "glass.css", "comic.css",
  "brutal.css", "stark.css", "frosted.css", "metallic.css",
]) {
  copyFileSync(join(STYLES_DIR, "themes", name), join(themesDist, name));
}

// Copy Vite-compiled CSS (with all Tailwind utilities resolved) for Remotion consumption
const assetsDir = join(DIST_DIR, "assets");
if (existsSync(assetsDir)) {
  for (const f of readdirSync(assetsDir)) {
    if (extname(f) === ".css") {
      copyFileSync(join(assetsDir, f), join(DIST_DIR, "styles.compiled.css"));
      break;
    }
  }
}

console.log("✅ Copied CSS files to dist/");
