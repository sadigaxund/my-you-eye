import { copyFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

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

console.log("✅ Copied CSS files to dist/");
