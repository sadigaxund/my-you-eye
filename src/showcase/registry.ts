import type { ReactNode } from "react";
import type { ShowcaseEntry, ShowcaseGroup } from "./types";
import { extractDemoSource } from "./extract-source";

export const GROUPS: ShowcaseGroup[] = [
  "inputs",
  "display",
  "feedback",
  "overlay",
  "navigation",
  "canvas",
  "data",
  "patterns",
  "decorators",
  "typography",
  "motion",
  "charts",
  "scenes",
];

export interface RegistryDemo {
  name: string;
  description?: string;
  render: () => ReactNode;
  /** Extracted JSX source, or null if extraction wasn't confident. */
  source: string | null;
  layout?: "fill" | "center";
  overflow?: "visible" | "auto" | "hidden";
  /** See `ShowcaseDemo.contain` — opts a demo out of the card's paint containment. */
  contain?: boolean;
}

export interface RegistryEntry {
  title: string;
  slug: string;
  group: ShowcaseGroup;
  parent?: string;
  description?: string;
  demos: RegistryDemo[];
}

/**
 * A sidebar-navigable page. Most pages wrap exactly one `RegistryEntry`.
 * Entries that declare a shared `parent` (see `ShowcaseEntry.parent`)
 * collapse into a single page with multiple `entries`, so related
 * components (e.g. Table / DataTable / DataList) can be browsed as one
 * consolidated section without merging their showcase files.
 */
export interface RegistryPage {
  slug: string;
  title: string;
  group: ShowcaseGroup;
  entries: RegistryEntry[];
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * The `id` of one demo's card heading, and the hash a TOC entry links to.
 * Namespaced by the entry slug so a parent page holding several entries
 * (Table / DataTable / DataList) can't collide two demos that share a name
 * ("Default" exists three times there), and so the leading segment is still
 * a page slug — `App.tsx`'s hash router reads everything before `--` as the
 * page to open, which is what makes a demo anchor deep-linkable.
 */
export function demoAnchor(entrySlug: string, demoName: string): string {
  return `${entrySlug}--${slugify(demoName)}`;
}

/** The `id` of an entry's generated API section. Same namespacing rules. */
export function apiAnchor(entrySlug: string): string {
  return `${entrySlug}--api`;
}

// Auto-discovery: every `*.showcase.tsx` under src/ui/ (and, once they exist,
// src/motion/, src/scenes/ and src/present/ — AGENTS.md §9d phase 0 /
// TODO.md A0, extended to src/present/ by Phase F) registers itself just by
// existing — no manual list. We glob twice: once for the live module
// (component + render fns) and once for the raw file text (used only to
// extract copy-pasteable JSX for the code toggle). Vite's import.meta.glob
// accepts an array of patterns and is happy when some of them match nothing,
// so this keeps working today even if any of these directories were empty.
//
// The pattern list MUST be written inline at each call site. `import.meta.glob`
// is compile-time syntax, not a function: Vite statically parses its arguments
// and rejects anything that isn't a literal ("Invalid glob import syntax: Could
// only use literals"). Hoisting these into a shared `const` array reads better
// but breaks the dev server outright — don't.
const modules = import.meta.glob([
  "../ui/**/*.showcase.tsx",
  "../motion/**/*.showcase.tsx",
  "../scenes/**/*.showcase.tsx",
  "../present/**/*.showcase.tsx",
], { eager: true }) as Record<string, { default: ShowcaseEntry }>;
const rawSources = import.meta.glob([
  "../ui/**/*.showcase.tsx",
  "../motion/**/*.showcase.tsx",
  "../scenes/**/*.showcase.tsx",
  "../present/**/*.showcase.tsx",
], {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

export const entries: RegistryEntry[] = Object.entries(modules)
  .map(([path, mod]) => {
    const entry = mod.default;
    const raw = rawSources[path] ?? "";
    return {
      title: entry.title,
      slug: slugify(entry.title),
      group: entry.group,
      parent: entry.parent,
      description: entry.description,
      demos: entry.demos.map((demo) => ({
        name: demo.name,
        description: demo.description,
        render: demo.render,
        source: raw ? extractDemoSource(raw, demo.name) : null,
        layout: demo.layout,
        overflow: demo.overflow,
        contain: demo.contain,
      })),
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

// Group entries into sidebar pages: entries sharing a `parent` collapse
// into one page (slugified from the parent name); everything else is its
// own single-entry page. Built once from `entries`, in title order, so a
// parent page's position/first-seen order is stable across reloads.
export const pages: RegistryPage[] = (() => {
  const result: RegistryPage[] = [];
  const parentPageBySlug = new Map<string, RegistryPage>();

  for (const entry of entries) {
    if (entry.parent) {
      const slug = slugify(entry.parent);
      let page = parentPageBySlug.get(slug);
      if (!page) {
        page = { slug, title: entry.parent, group: entry.group, entries: [] };
        parentPageBySlug.set(slug, page);
        result.push(page);
      }
      page.entries.push(entry);
    } else {
      result.push({ slug: entry.slug, title: entry.title, group: entry.group, entries: [entry] });
    }
  }

  return result.sort((a, b) => a.title.localeCompare(b.title));
})();

export function findPage(slug: string): RegistryPage | undefined {
  return pages.find((p) => p.slug === slug);
}

/**
 * Every page in the order the sidebar shows them: `GROUPS` order first, then
 * the alphabetical `pages` order within each group. This is the sequence the
 * prev/next footer walks, so "next" always means "the next thing down the
 * sidebar" rather than some second, invisible ordering.
 */
export const orderedPages: RegistryPage[] = GROUPS.flatMap((group) =>
  pages.filter((page) => page.group === group),
);

export function pageNeighbours(slug: string): { prev?: RegistryPage; next?: RegistryPage } {
  const index = orderedPages.findIndex((page) => page.slug === slug);
  if (index < 0) return {};
  return { prev: orderedPages[index - 1], next: orderedPages[index + 1] };
}
