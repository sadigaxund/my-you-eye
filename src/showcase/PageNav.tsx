import { Link } from "../ui/link";
import { cn } from "../lib/cn";
import type { RegistryPage } from "./registry";

function NavLink({ page, direction }: { page: RegistryPage; direction: "prev" | "next" }) {
  const isNext = direction === "next";
  return (
    <Link
      href={`#${page.slug}`}
      variant="muted"
      className={cn(
        "flex flex-col gap-1 rounded-ui border border-border px-4 py-3 no-underline hover:bg-secondary",
        isNext ? "items-end text-right" : "items-start",
      )}
    >
      <span className="block text-xs uppercase tracking-wide opacity-muted">{isNext ? "Next" : "Previous"}</span>
      <span className="block text-sm font-medium text-fg">{isNext ? `${page.title} →` : `← ${page.title}`}</span>
    </Link>
  );
}

/**
 * Prev/next through the sidebar's own global order (`orderedPages`), so
 * paging through the whole library never skips or repeats a page. Rendered
 * as `Link`s rather than buttons because they are navigation to a URL — the
 * hash they set is the same one the sidebar writes.
 */
export function PageNav({ prev, next }: { prev?: RegistryPage; next?: RegistryPage }) {
  if (!prev && !next) return null;
  return (
    <nav className="mt-16 grid grid-cols-2 gap-4 border-t border-border pt-8">
      <div>{prev && <NavLink page={prev} direction="prev" />}</div>
      <div className="flex justify-end">{next && <NavLink page={next} direction="next" />}</div>
    </nav>
  );
}
