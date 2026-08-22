// Export-drift guard for the public API.
//
// Every component folder under src/ui/** owns an index.ts that declares what
// that folder considers public. src/index.ts is the ONLY entry a consuming app
// imports from — so anything a folder index calls public that never reaches
// src/index.ts is unreachable, and the folder index is lying. That gap is
// invisible to tsc, to eslint, and to check-showcase.mjs (which only asserts
// that the folder is mentioned somewhere in src/index.ts, not that its symbols
// are). It is exactly the drift this script exists to catch.
//
// Rule: for each src/ui/**/index.ts, every symbol it exports must also be
// exported from src/index.ts, by the same name.
//
// Fixing a failure means one of two things, never a third:
//   1. The symbol is public  -> add it to src/index.ts.
//   2. The symbol is internal -> remove it from the folder's index.ts.
// Do not add an ignore list.
import ts from "typescript";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const UI_DIR = join(ROOT, "src/ui");
const ROOT_INDEX = join(ROOT, "src/index.ts");

/** Every name a module exports: `export {a, b}`, `export type {T}`,
 *  `export const x =`, `export function f`, `export interface I`, and
 *  re-export forms of all of those. `export *` is reported separately so a
 *  wildcard can never silently satisfy the check. */
function exportedNames(file) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf-8"),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );
  const names = new Set();
  const stars = [];

  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (statement.exportClause && ts.isNamedExports(statement.exportClause)) {
        for (const element of statement.exportClause.elements) names.add(element.name.text);
      } else if (!statement.exportClause) {
        stars.push(statement.moduleSpecifier?.text ?? "<unknown>");
      }
      continue;
    }
    const isExported = ts.canHaveModifiers(statement)
      && ts.getModifiers(statement)?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExported) continue;

    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) names.add(decl.name.text);
      }
    } else if ("name" in statement && statement.name && ts.isIdentifier(statement.name)) {
      names.add(statement.name.text);
    }
  }
  return { names, stars };
}

function componentFolders() {
  const out = [];
  for (const entry of readdirSync(UI_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    // Category container dirs hold one folder per component; their children
    // are the component folders. (decorators added with master's category model)
    const containers = ["patterns", "decorators"];
    if (containers.includes(entry.name)) {
      const containerDir = join(UI_DIR, entry.name);
      for (const child of readdirSync(containerDir, { withFileTypes: true })) {
        if (child.isDirectory()) out.push(join(containerDir, child.name));
      }
    } else {
      out.push(join(UI_DIR, entry.name));
    }
  }
  return out.sort();
}

const rootIndex = exportedNames(ROOT_INDEX);
const failures = [];

if (rootIndex.stars.length > 0) {
  failures.push(
    `src/index.ts uses \`export *\` (from ${rootIndex.stars.join(", ")}). The public API must list every symbol explicitly so this check — and a reader — can see it.`,
  );
}

for (const folder of componentFolders()) {
  const indexPath = join(folder, "index.ts");
  const rel = relative(ROOT, folder);
  if (!existsSync(indexPath)) {
    failures.push(`${rel}/ has no index.ts — every component folder declares its public surface in one.`);
    continue;
  }
  const { names, stars } = exportedNames(indexPath);
  for (const star of stars) {
    failures.push(`${rel}/index.ts uses \`export * from "${star}"\` — list the symbols explicitly.`);
  }
  const missing = [...names].filter((name) => !rootIndex.names.has(name)).sort();
  if (missing.length > 0) {
    failures.push(`${rel}/index.ts exports ${missing.length} symbol(s) missing from src/index.ts:\n      ${missing.join(", ")}`);
  }
}

if (failures.length > 0) {
  console.error("❌ Export drift — src/index.ts does not mirror every component folder's public surface:\n");
  for (const failure of failures) console.error(`  • ${failure}`);
  console.error(
    "\n  Fix by exporting the symbol from src/index.ts, or by removing it from the folder's index.ts if it is internal.\n",
  );
  process.exit(1);
}

console.log(`✅ src/index.ts mirrors all ${componentFolders().length} component folder indexes (${rootIndex.names.size} root exports)`);
