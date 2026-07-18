import { DemoSection } from "./DemoSection";
import type { RegistryPage } from "./registry";

export function ComponentPage({ page }: { page: RegistryPage | undefined }) {
  if (!page) {
    return (
      <p className="text-muted text-sm">
        No component selected. Pick one from the sidebar.
      </p>
    );
  }

  // A page normally wraps a single entry. When it consolidates several
  // (entries sharing a `parent`, e.g. Table / DataTable / DataList) each
  // keeps its own sub-heading + description so it's clear which demos
  // belong to which component, while still reading as one section.
  const isGroup = page.entries.length > 1;

  return (
    <article className="mx-auto max-w-5xl">
      <header className="mb-8 max-w-prose">
        <h1 className="text-2xl font-bold text-fg">{page.title}</h1>
      </header>

      {page.entries.map((entry) => (
        <section key={entry.slug} className="mb-12">
          {isGroup && (
            <h2 className="mb-4 border-b border-border pb-2 text-lg font-semibold text-fg">
              {entry.title}
            </h2>
          )}
          {entry.description && (
            <p className="text-muted text-sm mb-6 max-w-prose leading-relaxed">{entry.description}</p>
          )}
          {entry.demos.map((demo) => (
            <DemoSection key={demo.name} demo={demo} />
          ))}
        </section>
      ))}
    </article>
  );
}
