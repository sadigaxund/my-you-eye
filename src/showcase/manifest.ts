import manifestJson from "../../components.json";

/**
 * Typed, minimal view of the generated root manifest (`components.json`,
 * written by `scripts/gen-manifest.mjs` from every `*.showcase.tsx` plus the
 * component source it documents). The showcase reads it so the API reference
 * on each page is generated from the same single source of truth the
 * published `COMPONENTS.md` is — a hand-written props table in the showcase
 * would be a second inventory to keep in sync, and it would drift.
 *
 * One manifest record per showcase file, keyed by `name`, which is literally
 * the showcase entry's `title` (see gen-manifest's `parseShowcase`) — so
 * `RegistryEntry.title` is an exact key, no fuzzy matching.
 *
 * Only the fields this app renders are typed. The JSON is imported directly
 * (Vite resolves JSON natively); nothing here mutates it.
 */

export interface ManifestProp {
  type: string;
  optional: boolean;
  doc?: string;
}

export interface ManifestComponent {
  name: string;
  group: string;
  tier: string;
  /** Published subpath the component is imported from, e.g. "my-you-eye/motion". */
  entry: string;
  folder: string;
  variants: Record<string, string[]>;
  props: Record<string, ManifestProp>;
  description?: string;
  variantDefaults?: Record<string, string>;
  extends?: string[];
}

// Through `unknown`: TypeScript infers a full literal type for the imported
// JSON (114 records, each with its own exact `variants` shape), which has no
// structural overlap with the loose Record<> view above. The manifest's shape
// is guaranteed by its generator, not by this cast.
const components = (manifestJson as unknown as { components: ManifestComponent[] }).components;
const byName = new Map(components.map((component) => [component.name, component]));

export function findComponentApi(name: string): ManifestComponent | undefined {
  return byName.get(name);
}

/** A record is worth an API section only if it documents something. */
export function hasApi(api: ManifestComponent | undefined): api is ManifestComponent {
  if (!api) return false;
  return Object.keys(api.variants).length > 0 || Object.keys(api.props).length > 0;
}

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const squash = (value: string) => value.replace(/[^A-Za-z0-9]/g, "").toLowerCase();

/**
 * `import { Button } from "my-you-eye";` — derived from the manifest's own
 * `entry` subpath plus the component name, so it stays right by construction
 * even when a component changes tier.
 *
 * Returns null unless the name really is the exported symbol. Two guards:
 * it has to be a legal identifier, and it has to match the component folder
 * it documents (`ui/code-block` ↔ `CodeBlock`, `present/use-steps` ↔
 * `useSteps`). That second guard is what suppresses the line on the three
 * topic pages whose title names a subject rather than an export — "Motion
 * Core" (`motion/core`), "Typography & Tokens" (`ui/typography`) and
 * "Validation" (`scenes/validation-demo`). An import statement that doesn't
 * resolve is worse than no import statement.
 */
export function importStatement(api: ManifestComponent): string | null {
  if (!IDENTIFIER.test(api.name)) return null;
  const folderLeaf = api.folder.split("/").pop() ?? "";
  if (squash(folderLeaf) !== squash(api.name)) return null;
  return `import { ${api.name} } from "${api.entry}";`;
}

/**
 * Pulls a "Default X." sentence out of a prop's docblock into its own
 * column. Deliberately narrow: only a short, single-clause trailer counts,
 * so a sentence that merely mentions the word "default" in passing stays in
 * the description where it belongs.
 */
const DEFAULT_SENTENCE = /(^|\s)Defaults?\s+(?:to\s+)?([^.]{1,24})\.(\s|$)/;

export function splitDefault(doc: string | undefined): { doc?: string; def?: string } {
  if (!doc) return {};
  const match = DEFAULT_SENTENCE.exec(doc);
  if (!match) return { doc };
  const rest = (doc.slice(0, match.index) + " " + doc.slice(match.index + match[0].length)).trim();
  return { doc: rest || undefined, def: match[2].trim() };
}
