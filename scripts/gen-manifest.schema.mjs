// Schema-parsing half of scripts/gen-manifest.mjs, split into its own file
// purely for length (the same 250-line guideline AGENTS.md §2 applies to
// component code applies here too). Re-parses the actual
// `src/scenes/schema/*.ts` source on every run — never a hand-copied field
// list, so it can't silently go stale the way a manually written doc would
// the moment a scene gains or loses a field (TODO.md Phase H item 9).
import { readFileSync } from "node:fs";
import { join } from "node:path";

/** Index of the `{`/`}` in `src` that matches the `{` at `openIdx`. */
function findMatchingBrace(src, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

/** The `{ ... }` body text of `export interface <name> [extends X] { ... }`. */
function extractInterfaceBody(src, name) {
  const re = new RegExp(`(?:export\\s+)?interface\\s+${name}\\b[^{]*\\{`);
  const m = re.exec(src);
  if (!m) return null;
  const openIdx = m.index + m[0].length - 1;
  const closeIdx = findMatchingBrace(src, openIdx);
  return closeIdx < 0 ? null : src.slice(openIdx + 1, closeIdx);
}

/** The raw `X | Y | Z` text of `export type <name> = X | Y | Z;`. */
function extractTypeAliasRaw(src, name) {
  const re = new RegExp(`export\\s+type\\s+${name}\\s*=`);
  const m = re.exec(src);
  if (!m) return null;
  const eqIdx = m.index + m[0].length;
  let depth = 0;
  for (let i = eqIdx; i < src.length; i++) {
    const c = src[i];
    if (c === "{" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ")" || c === "]") depth--;
    else if (c === ";" && depth === 0) return src.slice(eqIdx, i).trim();
  }
  return null;
}

/** Splits an interface body into top-level `field: type;` segments — depth-
 * aware, so a nested object type's own internal `;`s don't split early. */
function splitTopLevelFields(body) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < body.length; i++) {
    const c = body[i];
    if (c === "{" || c === "(" || c === "[") depth++;
    else if (c === "}" || c === ")" || c === "]") depth--;
    else if (c === ";" && depth === 0) {
      parts.push(body.slice(start, i));
      start = i + 1;
    }
  }
  const rest = body.slice(start).trim();
  if (rest) parts.push(rest);
  return parts;
}

function parseField(raw) {
  let text = raw.trim();
  let description;
  const docMatch = text.match(/^\/\*\*([\s\S]*?)\*\/\s*/);
  if (docMatch) {
    description = docMatch[1]
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").trim())
      .filter(Boolean)
      .join(" ");
    text = text.slice(docMatch[0].length).trim();
  }
  const fieldMatch = text.match(/^(\w+)(\?)?\s*:\s*([\s\S]+)$/);
  if (!fieldMatch) return null;
  const [, name, optional, type] = fieldMatch;
  return { name, optional: Boolean(optional), type: type.replace(/\s+/g, " ").trim(), description };
}

function parseInterfaceFields(src, name) {
  const body = extractInterfaceBody(src, name);
  if (body == null) return null;
  return splitTopLevelFields(body).map((raw) => raw.trim()).filter(Boolean).map(parseField).filter(Boolean);
}

// Which schema file each scene kind's interface(s) live in — a fixed,
// structural map (this codebase's schema file layout, not a guess), same
// spirit as gen-manifest.mjs's own VARIANT_ATTRS. Cross-referenced against
// SceneRenderer's switch and src/scenes/schema/index.ts's exports.
const SCENE_SCHEMA_MAP = [
  { kind: "title", scene: { name: "TitleScene", file: "scenes" } },
  { kind: "bullets", scene: { name: "BulletScene", file: "scenes" }, step: { name: "BulletItem", file: "scenes" } },
  { kind: "code", scene: { name: "CodeScene", file: "scenes" }, step: { name: "CodeStep", file: "scenes" } },
  { kind: "terminal", scene: { name: "TerminalScene", file: "scenes" }, step: { name: "TerminalStep", file: "scenes" } },
  { kind: "diagram", scene: { name: "DiagramScene", file: "scenes.diagram" }, step: { name: "DiagramStep", file: "scenes.diagram" } },
  {
    kind: "sequence",
    scene: { name: "SequenceScene", file: "scenes.diagram" },
    stepVariants: [
      { name: "SequenceMessageStep", file: "scenes.diagram" },
      { name: "SequenceNoteStep", file: "scenes.diagram" },
    ],
  },
  { kind: "chart", scene: { name: "ChartScene", file: "scenes.data" }, step: { name: "ChartStep", file: "scenes.data" } },
  { kind: "stat", scene: { name: "StatScene", file: "scenes.data" }, step: { name: "StatItem", file: "scenes.data" } },
  { kind: "compare", scene: { name: "CompareScene", file: "scenes" }, typeAlias: { name: "ComparePane", file: "scenes" } },
  { kind: "walkthrough", scene: { name: "WalkthroughScene", file: "scenes" }, step: { name: "WalkthroughStep", file: "scenes" } },
  { kind: "outro", scene: { name: "OutroScene", file: "scenes" } },
];

/** Parses `src/scenes/schema/*.ts` into the `Video`/`VideoMeta`/`SceneBase`/
 * `StepBase` field lists plus every scene kind's own fields (and its step
 * type's fields, where it has one) — the whole `Video` schema, as data. */
export function buildVideoSchema(schemaDir) {
  const files = {
    video: readFileSync(join(schemaDir, "video.ts"), "utf-8"),
    steps: readFileSync(join(schemaDir, "steps.ts"), "utf-8"),
    scenes: readFileSync(join(schemaDir, "scenes.ts"), "utf-8"),
    "scenes.diagram": readFileSync(join(schemaDir, "scenes.diagram.ts"), "utf-8"),
    "scenes.data": readFileSync(join(schemaDir, "scenes.data.ts"), "utf-8"),
  };

  return {
    video: parseInterfaceFields(files.video, "Video") ?? [],
    meta: parseInterfaceFields(files.video, "VideoMeta") ?? [],
    sceneBase: parseInterfaceFields(files.steps, "SceneBase") ?? [],
    stepBase: parseInterfaceFields(files.steps, "StepBase") ?? [],
    scenes: SCENE_SCHEMA_MAP.map((entry) => {
      const out = {
        kind: entry.kind,
        interface: entry.scene.name,
        fields: parseInterfaceFields(files[entry.scene.file], entry.scene.name) ?? [],
      };
      if (entry.step) {
        out.stepInterface = entry.step.name;
        out.stepFields = parseInterfaceFields(files[entry.step.file], entry.step.name) ?? [];
      }
      if (entry.stepVariants) {
        out.stepVariants = entry.stepVariants.map((v) => ({
          interface: v.name,
          fields: parseInterfaceFields(files[v.file], v.name) ?? [],
        }));
      }
      if (entry.typeAlias) {
        out.typeAlias = { name: entry.typeAlias.name, raw: extractTypeAliasRaw(files[entry.typeAlias.file], entry.typeAlias.name) };
      }
      return out;
    }),
  };
}
