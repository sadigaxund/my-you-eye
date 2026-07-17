import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const UI_DIR = join(ROOT, "src/ui");

let warnings = [];

// 1. Check for duplicate GRID constants outside grid.ts
function checkGridConstants() {
  function walk(dir, depth = 0) {
    if (depth > 4) return;
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== "dist") {
          walk(join(dir, entry.name), depth + 1);
        }
      } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        const fp = join(dir, entry.name);
        if (fp.endsWith("grid.ts")) continue;
        const content = readFileSync(fp, "utf-8");
        const m = content.match(/\bconst\s+GRID\s*=\s*\d+/);
        if (m) {
          warnings.push(`Duplicate GRID constant in ${relative(ROOT, fp)}: \`${m[0]}\``);
        }
      }
    }
  }
  walk(join(ROOT, "src"));
}

// 2. Check for per-component scrollbar overrides (should all be global now)
function checkScrollbarOverrides() {
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== "dist") {
          walk(join(dir, entry.name));
        }
      } else if (entry.name.endsWith(".tsx") || entry.name.endsWith(".css")) {
        const fp = join(dir, entry.name);
        if (fp.endsWith("globals.css")) continue;
        if (fp.includes("tokens.css") || fp.includes("themes/")) continue;
        const content = readFileSync(fp, "utf-8");
        if (content.includes("scrollbarWidth") || content.includes("scrollbar-color") || content.includes("scrollbar-width")) {
          warnings.push(`Per-component scrollbar override in ${relative(ROOT, fp)}`);
        }
      }
    }
  }
  walk(UI_DIR);
}

// 3. Check for port implementation references (should use Port component, not PortDot)
function checkPortReuse() {
  function walk(dir) {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== "dist") {
          walk(join(dir, entry.name));
        }
      } else if (entry.name.endsWith(".tsx")) {
        const fp = join(dir, entry.name);
        const content = readFileSync(fp, "utf-8");
        if (content.includes("PortDot")) {
          warnings.push(`Orphaned PortDot reference in ${relative(ROOT, fp)} (should use Port component)`);
        }
      }
    }
  }
  walk(UI_DIR);
}

console.log("🔍 Project audit\n");

checkGridConstants();
checkScrollbarOverrides();
checkPortReuse();

if (warnings.length === 0) {
  console.log("✅ No issues found.\n");
} else {
  console.log(`⚠️  ${warnings.length} warning(s):\n`);
  for (const w of warnings) {
    console.log(`  • ${w}`);
  }
  console.log();
}
