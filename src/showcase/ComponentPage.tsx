import { ApiReference } from "./ApiReference";
import { DemoSection } from "./DemoSection";
import { EntryIntro, PageHeader } from "./PageHeader";
import { PageNav } from "./PageNav";
import { PageToc } from "./PageToc";
import type { TocItem } from "./PageToc";
import { apiAnchor, demoAnchor, pageNeighbours } from "./registry";
import type { RegistryEntry, RegistryPage } from "./registry";
import { findComponentApi, hasApi } from "./manifest";
import type { ShowcaseTexture } from "./types";

/** More than four demos is where a reader starts scrolling to find one. */
const TOC_MIN_DEMOS = 4;

function tocItems(page: RegistryPage): TocItem[] {
  const isGroup = page.entries.length > 1;
  const items: TocItem[] = [];
  for (const entry of page.entries) {
    if (isGroup) items.push({ id: `${entry.slug}--section`, label: entry.title, section: true });
    for (const demo of entry.demos) {
      items.push({ id: demoAnchor(entry.slug, demo.name), label: demo.name });
    }
    if (hasApi(findComponentApi(entry.title))) {
      items.push({ id: apiAnchor(entry.slug), label: isGroup ? `${entry.title} API` : "API" });
    }
  }
  return items;
}

function EntrySection({
  entry,
  texture,
  showHeading,
}: {
  entry: RegistryEntry;
  texture: ShowcaseTexture;
  showHeading: boolean;
}) {
  return (
    <section className="mb-16 last:mb-0">
      {showHeading && (
        <div id={`${entry.slug}--section`} className="mb-6 scroll-mt-6">
          <h2 className="mb-3 border-b border-border pb-2 text-xl font-semibold text-fg">{entry.title}</h2>
          <EntryIntro title={entry.title} description={entry.description} />
        </div>
      )}
      <div className="flex flex-col gap-8">
        {entry.demos.map((demo) => (
          <DemoSection
            key={demo.name}
            demo={demo}
            texture={texture}
            anchor={demoAnchor(entry.slug, demo.name)}
          />
        ))}
      </div>
      <ApiReference title={entry.title} entrySlug={entry.slug} texture={texture} />
    </section>
  );
}

/**
 * One component page, laid out the way a component library's docs page is:
 *
 *   header (group badge / title / blurb / import)
 *   → demo cards, all identical (see DemoSection)
 *   → generated API reference (see ApiReference)
 *   → prev/next through the sidebar order
 *   → an "On this page" rail alongside, on wide viewports only
 *
 * A page holding several entries (they declared a shared `parent`, e.g.
 * Table / DataTable / DataList) repeats the middle two per entry under that
 * entry's own heading; everything else is page-level.
 *
 * Per AGENTS.md §4 this is the only place page layout is decided — a demo
 * contributes content, never structure.
 */
export function ComponentPage({ texture, page }: { texture: ShowcaseTexture; page: RegistryPage | undefined }) {
  if (!page) {
    return <p className="text-muted text-sm">No component selected. Pick one from the sidebar.</p>;
  }

  const isGroup = page.entries.length > 1;
  const first = page.entries[0];
  const items = tocItems(page);
  const demoCount = page.entries.reduce((total, entry) => total + entry.demos.length, 0);
  const { prev, next } = pageNeighbours(page.slug);

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-10">
      <article className="min-w-0 flex-1">
        <PageHeader
          title={page.title}
          group={page.group}
          intro={isGroup ? undefined : { title: first.title, description: first.description }}
        />
        {page.entries.map((entry) => (
          <EntrySection key={entry.slug} entry={entry} texture={texture} showHeading={isGroup} />
        ))}
        <PageNav prev={prev} next={next} />
      </article>
      {demoCount > TOC_MIN_DEMOS && <PageToc items={items} />}
    </div>
  );
}
