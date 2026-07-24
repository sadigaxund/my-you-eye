import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const UI_DIR = join(ROOT, "src/ui");
const INDEX_TS = join(ROOT, "src/index.ts");

let errors = [];

// Category container dirs under src/ui/ — these group components one level
// deeper rather than being components themselves (see AGENTS.md §1 category
// map). "effects" is listed ahead of its creation in Track E; a missing dir is
// simply skipped.
const CONTAINER_DIRS = new Set(["patterns", "decorators", "effects"]);

// Collect all component folders under src/ui/ (and its category containers)
function findComponentDirs(dir) {
  const dirs = [];
  if (!existsSync(dir)) return dirs;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const subdir = join(dir, entry.name);
      // Only go one level deep for category containers
      if (CONTAINER_DIRS.has(entry.name)) {
        dirs.push(...findComponentDirs(subdir));
      } else {
        dirs.push(subdir);
      }
    }
  }
  return dirs;
}

const componentDirs = findComponentDirs(UI_DIR);

// 1. Each component folder must have a *.showcase.tsx file
for (const dir of componentDirs) {
  const entries = readdirSync(dir);
  const showcaseFiles = entries.filter((f) => f.endsWith(".showcase.tsx"));
  if (showcaseFiles.length === 0) {
    errors.push(`Missing showcase file in ${relative(ROOT, dir)}`);
  } else if (showcaseFiles.length > 1) {
    errors.push(`Multiple showcase files in ${relative(ROOT, dir)}`);
  }
}

// 2. Read index.ts and check that each component folder is exported
if (existsSync(INDEX_TS)) {
  const indexContent = readFileSync(INDEX_TS, "utf-8");
  for (const dir of componentDirs) {
    const exportPath = `./ui/${relative(UI_DIR, dir)}`;
    if (!indexContent.includes(exportPath)) {
      errors.push(`Missing export in src/index.ts for ${relative(ROOT, dir)} (expected ${exportPath})`);
    }
  }
}

if (errors.length > 0) {
  console.error("❌ Showcase coverage check failed:\n");
  for (const err of errors) {
    console.error(`  • ${err}`);
  }
  process.exit(1);
}

console.log("✅ All component folders have showcase files and are exported from src/index.ts");
process.exit(0);
