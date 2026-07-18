// Generates components.json (machine) + COMPONENTS.md (human) from the
// *.showcase.tsx files. The showcase files are the single source of truth —
// this script never hand-maintains a list. Run on pre-commit and prebuild.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const UI_DIR = join(ROOT, "src/ui");

// Attributes we treat as design variants when scanning demos. Everything else
// (className, onClick, style, ...) is ignored so the manifest stays signal-only.
const VARIANT_ATTRS = new Set([
  "variant", "size", "state", "style", "side", "density",
  "shape", "align", "type", "orientation", "tone",
]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith(".showcase.tsx")) out.push(p);
  }
  return out;
}

function parseShowcase(file) {
  const src = readFileSync(file, "utf-8");
  const title = src.match(/title:\s*["'`]([^"'`]+)["'`]/)?.[1];
  const group = src.match(/group:\s*["'`]([^"'`]+)["'`]/)?.[1];
  if (!title || !group) return null;

  const demos = [...src.matchAll(/name:\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);

  const props = {};
  for (const m of src.matchAll(/(\w+)=["']([\w-]+)["']/g)) {
    const [, attr, value] = m;
    if (!VARIANT_ATTRS.has(attr)) continue;
    (props[attr] ??= new Set()).add(value);
  }
  const propsOut = Object.fromEntries(
    Object.entries(props).map(([k, v]) => [k, [...v].sort()]),
  );

  const folder = relative(join(ROOT, "src"), file).replace(/\/[^/]+$/, "");
  return { name: title, group, folder, props: propsOut, demos };
}

const components = walk(UI_DIR)
  .map(parseShowcase)
  .filter(Boolean)
  .sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

const manifest = {
  package: JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8")).name,
  generated: "auto — do not edit by hand; run `npm run manifest`",
  count: components.length,
  components,
};

writeFileSync(join(ROOT, "components.json"), JSON.stringify(manifest, null, 2) + "\n");

// --- COMPONENTS.md ---
const byGroup = {};
for (const c of components) (byGroup[c.group] ??= []).push(c);

let md = `# Components\n\n`;
md += `> Auto-generated from \`*.showcase.tsx\` by \`scripts/gen-manifest.mjs\`. Do not edit by hand.\n\n`;
md += `All components import from the package root:\n\n`;
md += "```tsx\nimport { Button, Card } from \"" + manifest.package + "\";\nimport \"" + manifest.package + "/styles.css\";\n```\n\n";
md += `**${components.length} components** across ${Object.keys(byGroup).length} groups.\n\n`;

for (const group of Object.keys(byGroup).sort()) {
  md += `## ${group}\n\n`;
  md += `| Component | Variants | Demos |\n|---|---|---|\n`;
  for (const c of byGroup[group]) {
    const variants = Object.entries(c.props)
      .map(([k, v]) => `${k}: ${v.join(" / ")}`)
      .join("<br>") || "—";
    md += `| \`${c.name}\` | ${variants} | ${c.demos.join(", ")} |\n`;
  }
  md += `\n`;
}

writeFileSync(join(ROOT, "COMPONENTS.md"), md);

console.log(`✅ Wrote components.json + COMPONENTS.md (${components.length} components)`);
