import { DemoSection } from "./DemoSection";
import type { RegistryPage } from "./registry";
import type { ShowcaseTexture } from "./types";

export function ComponentPage({ texture, page }: { texture: ShowcaseTexture; page: RegistryPage | undefined }) {
  if (!page) {
    return (
      <p className="text-muted text-sm">
        No component selected. Pick one from the sidebar.
      </p>
    );
  }

  const isGroup = page.entries.length > 1;

  return (
    <article className="mx-auto max-w-5xl">
      <header className="mb-6 max-w-prose">
        <h1 className="text-2xl font-bold text-fg [text-shadow:0_1px_3px_color-mix(in_srgb,var(--color-fg)_12%,transparent)]">
          {page.title}
        </h1>
      </header>

      {page.entries.map((entry) => (
        <section key={entry.slug} className="mb-12">
          {isGroup && (
            <h2 className="mb-3 border-b border-border pb-2 text-lg font-semibold text-fg">
              {entry.title}
            </h2>
          )}
          {entry.description && (
            <p className="text-muted text-sm mb-4 max-w-[36ch] leading-relaxed">{entry.description}</p>
          )}
          {entry.demos.map((demo) => (
            <DemoSection key={demo.name} demo={demo} texture={texture} />
          ))}
        </section>
      ))}
    </article>
  );
}
