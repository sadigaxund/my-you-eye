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
];

export interface RegistryDemo {
  name: string;
  description?: string;
  render: () => ReactNode;
  /** Extracted JSX source, or null if extraction wasn't confident. */
  source: string | null;
  layout?: "fill" | "center";
  overflow?: "visible" | "auto" | "hidden";
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

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Auto-discovery: every `*.showcase.tsx` under src/ui/ registers itself just
// by existing — no manual list. We glob twice: once for the live module
// (component + render fns) and once for the raw file text (used only to
// extract copy-pasteable JSX for the code toggle).
const modules = import.meta.glob("../ui/**/*.showcase.tsx", { eager: true }) as Record<
  string,
  { default: ShowcaseEntry }
>;
const rawSources = import.meta.glob("../ui/**/*.showcase.tsx", {
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
