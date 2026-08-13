// Generates components.json (machine) + COMPONENTS.md (human) from the
// *.showcase.tsx files across every tier (src/ui, src/motion, src/scenes,
// src/present), plus the `Video` schema itself, parsed by
// scripts/gen-manifest.schema.mjs (TODO.md Phase H item 9: "an agent in a
// consuming project can author a video from the manifest alone"). The
// showcase files and the schema source are the single sources of truth —
// this script never hand-maintains a component list or a field list. Run on
// pre-commit and prebuild.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { buildVideoSchema } from "./gen-manifest.schema.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const UI_DIR = join(ROOT, "src/ui");
const MOTION_DIR = join(ROOT, "src/motion");
const SCENES_DIR = join(ROOT, "src/scenes");
const PRESENT_DIR = join(ROOT, "src/present");
const SCHEMA_DIR = join(ROOT, "src/scenes/schema");

// Attributes we treat as design variants when scanning demos. Everything else
// (className, onClick, style, ...) is ignored so the manifest stays signal-only.
const VARIANT_ATTRS = new Set([
  "variant", "size", "state", "style", "side", "density",
  "shape", "align", "type", "orientation", "tone",
]);

const TIER_ENTRY = {
  ui: "my-you-eye",
  motion: "my-you-eye/motion",
  scenes: "my-you-eye/scenes",
  present: "my-you-eye/present",
};

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else if (entry.name.endsWith(".showcase.tsx")) out.push(p);
  }
  return out;
}

function parseShowcase(file, tier) {
  const src = readFileSync(file, "utf-8");

  // Restrict title/group extraction to after the `const entry:` declaration
  // to avoid matching JSX props (e.g. toast({ title: "Saved" })).
  const entryIdx = src.search(/\bconst entry:/);
  const afterEntry = entryIdx >= 0 ? src.slice(entryIdx) : src;

  const title = afterEntry.match(/title:\s*["'`]([^"'`]+)["'`]/)?.[1];
  const group = afterEntry.match(/group:\s*["'`]([^"'`]+)["'`]/)?.[1];
  if (!title || !group) return null;

  const demos = [...afterEntry.matchAll(/name:\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]);

  // Scan the full file for UI component props (CVA variant values).
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
  return { name: title, group, tier, entry: TIER_ENTRY[tier], folder, props: propsOut, demos };
}

const components = [
  ...walk(UI_DIR).map((f) => parseShowcase(f, "ui")),
  ...walk(MOTION_DIR).map((f) => parseShowcase(f, "motion")),
  ...walk(SCENES_DIR).map((f) => parseShowcase(f, "scenes")),
  ...walk(PRESENT_DIR).map((f) => parseShowcase(f, "present")),
]
  .filter(Boolean)
  .sort((a, b) => a.tier.localeCompare(b.tier) || a.group.localeCompare(b.group) || a.name.localeCompare(b.name));

const videoSchema = buildVideoSchema(SCHEMA_DIR);

for (const check of [
  ["Video", videoSchema.video],
  ["VideoMeta", videoSchema.meta],
  ["SceneBase", videoSchema.sceneBase],
  ["StepBase", videoSchema.stepBase],
]) {
  if (check[1].length === 0) {
    console.error(`❌ gen-manifest: found no fields for ${check[0]} — schema parser is out of sync with src/scenes/schema/*.ts.`);
    process.exit(1);
  }
}
for (const s of videoSchema.scenes) {
  if (s.fields.length === 0) {
    console.error(`❌ gen-manifest: found no fields for scene interface ${s.interface} (kind "${s.kind}") — schema parser is out of sync with src/scenes/schema/*.ts.`);
    process.exit(1);
  }
}

// --- components.json ---------------------------------------------------

const manifest = {
  package: JSON.parse(readFileSync(join(ROOT, "package.json"), "utf-8")).name,
  generated: "auto — do not edit by hand; run `npm run manifest`",
  count: components.length,
  components,
  videoSchema,
};

writeFileSync(join(ROOT, "components.json"), JSON.stringify(manifest, null, 2) + "\n");

// --- COMPONENTS.md -------------------------------------------------------

const byGroup = {};
for (const c of components) (byGroup[c.group] ??= []).push(c);

function fieldsTable(fields) {
  if (!fields || fields.length === 0) return "_none_\n";
  let out = "| Field | Type | Description |\n|---|---|---|\n";
  for (const f of fields) {
    const name = f.optional ? `${f.name}?` : f.name;
    const type = "`" + f.type.replace(/\|/g, "\\|") + "`";
    out += `| \`${name}\` | ${type} | ${(f.description ?? "—").replace(/\|/g, "\\|")} |\n`;
  }
  return out;
}

let md = `# Components\n\n`;
md += `> Auto-generated from \`*.showcase.tsx\` and \`src/scenes/schema/*.ts\` by \`scripts/gen-manifest.mjs\`. Do not edit by hand.\n\n`;
md += `Import from whichever subpath matches what you need:\n\n`;
md += "```tsx\nimport { Button, Card } from \"" + manifest.package + "\";\nimport { Reveal, Stagger } from \"" + manifest.package + "/motion\";\nimport { CodeScene, DiagramScene, SceneRenderer } from \"" + manifest.package + "/scenes\";\nimport { Presenter, SpeakerView, useSteps } from \"" + manifest.package + "/present\";\nimport { PlayerEmbed } from \"" + manifest.package + "/present/player\";\nimport { VideoRoot } from \"" + manifest.package + "/video\";\nimport \"" + manifest.package + "/styles.css\";\n```\n\n";
md += `**${components.length} components** across ${Object.keys(byGroup).length} groups and 4 tiers (\`ui\` / \`motion\` / \`scenes\` / \`present\`).\n\n`;

// Video schema section — this is the part that lets an agent in a consuming
// project author a whole video from this file alone, per TODO.md Phase H
// item 9.
md += `## Video schema\n\n`;
md += `\`my-you-eye/scenes\` is the entire authoring surface for a video: one \`Video\` object, described field-by-field below. Nothing in this schema is a \`className\`, \`style\`, color, frame count, or pixel coordinate — appearance and pacing are the library's job, not the caller's (TODO.md D5). \`<VideoRoot video={video} />\` (\`my-you-eye/video\`) renders it to MP4; \`<Presenter video={video} />\` / \`<PlayerEmbed video={video} />\` (\`my-you-eye/present\`, \`my-you-eye/present/player\`) render the same object live, with identical pacing.\n\n`;
md += `### \`Video\`\n\n${fieldsTable(videoSchema.video)}\n`;
md += `### \`VideoMeta\` (\`Video.meta\`)\n\n${fieldsTable(videoSchema.meta)}\n`;
md += `### Fields every scene accepts (\`SceneBase\`)\n\n${fieldsTable(videoSchema.sceneBase)}\n`;
md += `### Fields every step accepts (\`StepBase\`)\n\n${fieldsTable(videoSchema.stepBase)}\n`;
md += `### Scene kinds\n\n`;
md += `Each \`Video.scenes[]\` entry is one of these eleven, discriminated by \`kind\`. Every scene's own fields are listed below IN ADDITION to \`SceneBase\` above; every step type's own fields are listed IN ADDITION to \`StepBase\` above.\n\n`;
for (const s of videoSchema.scenes) {
  md += `#### \`kind: "${s.kind}"\` — \`${s.interface}\`\n\n`;
  md += fieldsTable(s.fields) + "\n";
  if (s.stepInterface) {
    md += `Step (\`${s.stepInterface}\`):\n\n${fieldsTable(s.stepFields)}\n`;
  }
  if (s.stepVariants) {
    for (const v of s.stepVariants) {
      md += `Step variant (\`${v.interface}\`):\n\n${fieldsTable(v.fields)}\n`;
    }
  }
  if (s.typeAlias) {
    // Re-indent uniformly: extractTypeAliasRaw's own `.trim()` only affects
    // the string's outer ends, so the source's original per-line indent
    // (rendered inconsistently after that trim) is normalized here instead.
    const lines = (s.typeAlias.raw ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
    md += `\`${s.typeAlias.name}\`:\n\n\`\`\`ts\ntype ${s.typeAlias.name} =\n  ${lines.join("\n  ")};\n\`\`\`\n\n`;
  }
}

// Per-group component tables.
for (const group of Object.keys(byGroup).sort()) {
  md += `## ${group}\n\n`;
  md += `| Component | Tier | Variants | Demos |\n|---|---|---|---|\n`;
  for (const c of byGroup[group]) {
    const variants = Object.entries(c.props)
      .map(([k, v]) => `${k}: ${v.join(" / ")}`)
      .join("<br>") || "—";
    md += `| \`${c.name}\` | \`${c.entry}\` | ${variants} | ${c.demos.join(", ")} |\n`;
  }
  md += `\n`;
}

writeFileSync(join(ROOT, "COMPONENTS.md"), md);

console.log(`✅ Wrote components.json + COMPONENTS.md (${components.length} components, ${videoSchema.scenes.length} scene kinds documented)`);
