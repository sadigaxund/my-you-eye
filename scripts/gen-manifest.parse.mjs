// AST extraction for scripts/gen-manifest.mjs.
//
// Everything here uses the TypeScript compiler API rather than regexes. The
// previous regex extractor had three separate failure modes, all of which are
// structural and none of which a better regex fixes:
//
//   1. Demo names were matched with /name:\s*["'`]([^"'`]+)["'`]/, so the first
//      escaped quote inside a name ended the match — `spring=\"bouncy\"` in
//      src/motion/camera/Camera.showcase.tsx came out as `spring=\`.
//   2. "Props" were scraped from JSX attributes against a hand-maintained
//      allowlist (variant/size/state/...) that knew nothing of the motion and
//      scenes vocabulary, so 54 of 114 components reported `props: {}`.
//   3. Attributes were matched file-wide, so a nested component's props were
//      attributed to the component the showcase is about.
//
// The replacement reads the two things that are actually authoritative: the
// component's own exported `<Name>Props` declaration, and the `variants` object
// of its `cva()` call.
import ts from "typescript";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const MAX_TYPE_LEN = 200;
const MAX_DOC_LEN = 300;

function parse(file) {
  return ts.createSourceFile(
    file,
    readFileSync(file, "utf-8"),
    ts.ScriptTarget.Latest,
    /* setParentNodes */ true,
    ts.ScriptKind.TSX,
  );
}

/** Node text with all internal whitespace collapsed, so a multi-line union or
 *  function type renders as one legible cell. */
function compactType(node, source) {
  const text = node.getText(source).replace(/\s+/g, " ").trim();
  return text.length > MAX_TYPE_LEN ? `${text.slice(0, MAX_TYPE_LEN - 1)}…` : text;
}

/** First sentence of a member's doc comment, or undefined. The terminator must
 *  be followed by a capital or end-of-string, so "e.g." and "i.e." mid-sentence
 *  don't truncate the summary. */
function docFirstSentence(node) {
  const jsdoc = ts.getJSDocCommentsAndTags(node).find(ts.isJSDoc);
  const raw = jsdoc && ts.getTextOfJSDocComment(jsdoc.comment);
  if (!raw) return undefined;
  const flat = raw.replace(/\s+/g, " ").trim();
  const sentence = flat.match(/^.*?[.!?](?=\s+[A-Z]|\s*$)/)?.[0] ?? flat;
  return sentence.length > MAX_DOC_LEN ? `${sentence.slice(0, MAX_DOC_LEN - 1)}…` : sentence;
}

function memberName(member, source) {
  if (!member.name) return null;
  if (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)) return member.name.text;
  return member.name.getText(source);
}

function collectMembers(members, source, out) {
  for (const member of members) {
    if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) continue;
    const name = memberName(member, source);
    if (!name) continue;
    const type = ts.isPropertySignature(member) && member.type
      ? compactType(member.type, source)
      : compactType(member, source);
    const entry = { type, optional: Boolean(member.questionToken) };
    const doc = docFirstSentence(member);
    if (doc) entry.doc = doc;
    out[name] = entry;
  }
}

/** Every interface / type-alias declaration in a folder's non-showcase source
 *  files, by name. A component's Props type is often declared in a sibling
 *  (`./types.ts`) and re-exported, so a single-file lookup misses it. */
function folderDeclarations(dir) {
  const declarations = new Map();
  if (!existsSync(dir)) return declarations;
  for (const name of readdirSync(dir)) {
    if (!/\.tsx?$/.test(name) || name.includes(".showcase.")) continue;
    const source = parse(join(dir, name));
    const visit = (node) => {
      if ((ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) && !declarations.has(node.name.text)) {
        declarations.set(node.name.text, { node, source });
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return declarations;
}

/** `{ props, extends }` for `<base>Props`, resolving interface heritage and
 *  intersection members. Unknown / absent type -> empty props. */
function propsOf(dir, base) {
  const declarations = folderDeclarations(dir);
  const found = declarations.get(`${base}Props`);
  const props = {};
  const extend = [];
  if (!found) return { props, extends: extend };
  const { node, source } = found;

  if (ts.isInterfaceDeclaration(node)) {
    collectMembers(node.members, source, props);
    for (const clause of node.heritageClauses ?? []) {
      for (const type of clause.types) extend.push(compactType(type, source));
    }
  } else if (ts.isIntersectionTypeNode(node.type)) {
    for (const part of node.type.types) {
      if (ts.isTypeLiteralNode(part)) collectMembers(part.members, source, props);
      else extend.push(compactType(part, source));
    }
  } else if (ts.isTypeLiteralNode(node.type)) {
    collectMembers(node.type.members, source, props);
  } else {
    extend.push(compactType(node.type, source));
  }
  return { props, extends: extend };
}

function objectKeys(node) {
  if (!node || !ts.isObjectLiteralExpression(node)) return [];
  return node.properties
    .map((p) => (p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) ? p.name.text : null))
    .filter(Boolean);
}

function objectProperty(node, key) {
  if (!node || !ts.isObjectLiteralExpression(node)) return undefined;
  const match = node.properties.find(
    (p) => ts.isPropertyAssignment(p) && p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === key,
  );
  return match?.initializer;
}

/** CVA variant axes and their literal values, merged across every `cva()` call
 *  in the component's own file (Switch declares two: root + thumb). Axes whose
 *  keys aren't statically determinable are skipped rather than guessed. */
function variantsOf(mainFile) {
  const variants = {};
  const defaults = {};
  if (!existsSync(mainFile)) return { variants, defaults };
  const source = parse(mainFile);
  const visit = (node) => {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "cva") {
      const config = node.arguments[1];
      const axes = objectProperty(config, "variants");
      if (axes && ts.isObjectLiteralExpression(axes)) {
        for (const axis of axes.properties) {
          if (!ts.isPropertyAssignment(axis) || !axis.name) continue;
          if (!ts.isIdentifier(axis.name) && !ts.isStringLiteral(axis.name)) continue;
          const values = objectKeys(axis.initializer);
          if (values.length === 0) continue;
          variants[axis.name.text] = [...new Set([...(variants[axis.name.text] ?? []), ...values])].sort();
        }
      }
      const defaultAxes = objectProperty(config, "defaultVariants");
      if (defaultAxes && ts.isObjectLiteralExpression(defaultAxes)) {
        for (const axis of defaultAxes.properties) {
          if (!ts.isPropertyAssignment(axis) || !axis.name || !ts.isIdentifier(axis.name)) continue;
          // A boolean axis (`underline: { true: …, false: … }` on Link) keys
          // its values as the strings "true"/"false" but writes the default
          // as a real boolean literal, so a string-only read silently drops
          // it and the manifest reports an axis with no default.
          const init = axis.initializer;
          if (ts.isStringLiteral(init)) defaults[axis.name.text] = init.text;
          else if (init.kind === ts.SyntaxKind.TrueKeyword) defaults[axis.name.text] = "true";
          else if (init.kind === ts.SyntaxKind.FalseKeyword) defaults[axis.name.text] = "false";
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return { variants, defaults };
}

function stringOf(node) {
  return node && ts.isStringLiteral(node) ? node.text : undefined;
}

/** Demo names declared in an array literal of `{ name: "..." }` objects.
 *  `resolveSpread` handles `...someDemos` imported from a sibling file. */
function demoNames(arrayNode, resolveSpread) {
  const names = [];
  if (!arrayNode || !ts.isArrayLiteralExpression(arrayNode)) return names;
  for (const element of arrayNode.elements) {
    if (ts.isObjectLiteralExpression(element)) {
      const name = stringOf(objectProperty(element, "name"));
      if (name) names.push(name);
    } else if (ts.isSpreadElement(element) && ts.isIdentifier(element.expression)) {
      names.push(...resolveSpread(element.expression.text));
    }
  }
  return names;
}

/** Finds `export const <id>: ShowcaseDemo[] = [...]` in a sibling file so a
 *  showcase that splits its demos out still reports every demo name. */
function siblingDemoArray(dir, identifier) {
  for (const name of readdirSync(dir)) {
    if (!/\.tsx?$/.test(name)) continue;
    const source = parse(join(dir, name));
    for (const statement of source.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === identifier && decl.initializer) {
          return demoNames(decl.initializer, () => []);
        }
      }
    }
  }
  return [];
}

/** `{ title, group, description?, parent?, demos }` from a showcase file's
 *  `const entry: ShowcaseEntry = { ... }` declaration. */
export function parseShowcaseEntry(file) {
  const source = parse(file);
  const dir = dirname(file);
  let object;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(decl.name)
        && decl.name.text === "entry"
        && decl.initializer
        && ts.isObjectLiteralExpression(decl.initializer)
      ) object = decl.initializer;
    }
  }
  if (!object) return null;

  const title = stringOf(objectProperty(object, "title"));
  const group = stringOf(objectProperty(object, "group"));
  if (!title || !group) return null;

  const entry = {
    title,
    group,
    demos: demoNames(objectProperty(object, "demos"), (id) => siblingDemoArray(dir, id)),
  };
  const description = stringOf(objectProperty(object, "description"));
  if (description) entry.description = description;
  const parent = stringOf(objectProperty(object, "parent"));
  if (parent) entry.parent = parent;
  return entry;
}

/** Props + CVA variants for the component a showcase file documents. The main
 *  source is the showcase path with `.showcase` dropped (Camera.showcase.tsx ->
 *  Camera.tsx); showcases with no component file of their own report nothing. */
export function parseComponentApi(showcaseFile) {
  const dir = dirname(showcaseFile);
  const base = basename(showcaseFile, ".showcase.tsx");
  const mainFile = join(dir, `${base}.tsx`);
  const { variants, defaults } = variantsOf(mainFile);
  const { props, extends: extend } = propsOf(dir, base);
  return { props, extends: extend, variants, variantDefaults: defaults };
}
