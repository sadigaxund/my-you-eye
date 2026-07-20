import { copyFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const STYLES_DIR = join(ROOT, "src/styles");
const DIST_DIR = join(ROOT, "dist");

copyFileSync(join(STYLES_DIR, "globals.css"), join(DIST_DIR, "styles.css"));
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
