import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const TOKENS = join(ROOT, "src/styles/tokens.css");
const THEMES_DIR = join(ROOT, "src/styles/themes");

const tokensRaw = readFileSync(TOKENS, "utf-8");

// Extract all --* token names from the @theme block
const tokenPattern = /--([\w-]+):/g;
const baseTokens = new Set();
let match;
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
const excludedTokens = new Set(["texture-paper", "texture-size"]);

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
  const content = readFileSync(join(THEMES_DIR, file), "utf-8");
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
