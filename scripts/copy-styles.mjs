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
//  2. #45: font urls become relative to the CSS file; the woff2 files are copied
//     into dist/fonts/ below.
const TW_IMPORT = '@import "tailwindcss";';
const FONT_URL = 'url("/fonts/';
let css = readFileSync(join(STYLES_DIR, "globals.css"), "utf8");
if (!css.includes(TW_IMPORT)) fail(`anchor ${TW_IMPORT} not found in globals.css`);
if (!css.includes(FONT_URL)) fail(`no ${FONT_URL}...) font urls found in globals.css`);
css = css.replace(TW_IMPORT, `${TW_IMPORT}\n@source "./*.js";`);
css = css.replaceAll(FONT_URL, 'url("./fonts/');
writeFileSync(join(DIST_DIR, "styles.css"), css);

const FONTS_SRC = join(ROOT, "public/fonts");
const FONTS_DIST = join(DIST_DIR, "fonts");
const fonts = existsSync(FONTS_SRC) ? readdirSync(FONTS_SRC).filter((f) => extname(f) === ".woff2") : [];
if (fonts.length === 0) fail("no public/fonts/*.woff2 found to ship");
mkdirSync(FONTS_DIST, { recursive: true });
for (const f of fonts) copyFileSync(join(FONTS_SRC, f), join(FONTS_DIST, f));
for (const m of css.matchAll(/url\("\.\/fonts\/([^"]+)"\)/g)) {
  if (!fonts.includes(m[1])) fail(`styles.css references fonts/${m[1]} but it is not in public/fonts`);
}
copyFileSync(join(STYLES_DIR, "tokens.css"), join(DIST_DIR, "tokens.css"));

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
