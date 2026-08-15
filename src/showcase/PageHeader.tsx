import { Badge } from "../ui/badge";
import { CodeBlock } from "../ui/code-block";
import { cn } from "../lib/cn";
import { findComponentApi, importStatement } from "./manifest";

export interface EntryIntroProps {
  /** Showcase entry title — the manifest key, and the imported symbol. */
  title: string;
  description?: string;
  className?: string;
}

/**
 * The description + copyable import line an entry leads with. Split out from
 * `PageHeader` because a parent page (Table / DataTable / DataList) repeats
 * it once per entry under that entry's own heading, while a single-entry
 * page shows it once in the page header.
 *
 * The import statement is derived, never authored: the manifest record
 * carries the published subpath this component ships on (`my-you-eye`,
 * `my-you-eye/motion`, …), so the line is right by construction even when a
 * component moves tiers. `CodeBlock` supplies the copy button; no `language`
 * is passed on purpose — that would add a header bar and a language badge
 * around what is one line of text.
 */
export function EntryIntro({ title, description, className }: EntryIntroProps) {
  const api = findComponentApi(title);
  const statement = api ? importStatement(api) : null;
  if (!description && !statement) return null;
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {description && <p className="max-w-prose text-base leading-relaxed text-muted">{description}</p>}
      {statement && <CodeBlock code={statement} wrap={false} className="max-w-prose" />}
    </div>
  );
}

export interface PageHeaderProps {
  title: string;
  group: string;
  /** Only for a single-entry page; a parent page renders one intro per entry. */
  intro?: { title: string; description?: string };
}

export function PageHeader({ title, group, intro }: PageHeaderProps) {
  return (
    <header className="mb-10 flex flex-col gap-3 border-b border-border pb-8">
      <Badge variant="primary" tone="soft" className="w-fit uppercase tracking-wide">
        {group}
      </Badge>
      <h1 className="text-3xl font-bold tracking-tight text-fg">{title}</h1>
      {intro && <EntryIntro title={intro.title} description={intro.description} className="mt-1" />}
    </header>
  );
}
