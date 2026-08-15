import { Link } from "../ui/link";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../lib/cn";

export interface TocItem {
  id: string;
  label: string;
  /** An entry heading inside a multi-entry (parent) page, not a demo. */
  section?: boolean;
}

/**
 * The right-hand "On this page" rail. Hidden below `xl` — below that width
 * the demo cards already need the full column, and a wrapped TOC would push
 * the content it indexes off screen.
 *
 * Every item is a hash link, which is also how the rail participates in
 * routing: `App.tsx` reads the page slug out of the leading segment of the
 * hash, so these links work from a cold load as well as from the page they
 * were rendered on.
 */
export function PageToc({ items }: { items: TocItem[] }) {
  return (
    <aside className="hidden w-56 shrink-0 xl:block">
      <div className="sticky top-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">On this page</p>
        <ScrollArea orientation="vertical" className="max-h-[calc(100dvh-8rem)] border-l border-border">
          <nav className="flex flex-col gap-2 pl-4">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                variant="muted"
                className={cn("text-sm leading-snug no-underline", item.section && "font-semibold text-fg")}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}
