import { useMemo, useState } from "react";
import { Input } from "../ui/input";
import { cn } from "../lib/cn";
import { TexturedSurface } from "../ui/decorators/textured-surface";
import { GROUPS, pages } from "./registry";
import type { ShowcaseTexture } from "./types";

interface SidebarProps {
  texture: ShowcaseTexture;
  activeSlug: string | undefined;
  onSelect: (slug: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ texture, activeSlug, onSelect, mobileOpen, onCloseMobile }: SidebarProps) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return pages;
    return pages.filter((p) => p.title.toLowerCase().includes(q));
  }, [filter]);

  return (
    <TexturedSurface
      texture={texture}
      layer="surface"
      strength="subtle"
      color="--color-canvas-surface"
      className={cn(
        "shrink-0 border-0 lg:sticky lg:top-0 lg:block lg:h-dvh lg:w-64 lg:border-r lg:border-border",
        mobileOpen
          ? "block fixed inset-x-0 top-0 bottom-0 z-40 border-b border-border"
          : "hidden",
      )}
    >
      <div className="flex h-full flex-col gap-4 p-panel">
        <Input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter components..."
          aria-label="Filter components"
        />
        <nav className="flex-1 space-y-6 overflow-auto">
          {GROUPS.map((group) => {
            const groupPages = filtered.filter((p) => p.group === group);
            if (groupPages.length === 0) return null;
            return (
              <div key={group}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  {group}
                </p>
                <ul className="space-y-1">
                  {groupPages.map((page) => (
                    <li key={page.slug}>
                      <button
                        type="button"
                        onClick={() => {
                          onSelect(page.slug);
                          onCloseMobile();
                        }}
                        className={cn(
                          "w-full cursor-pointer rounded-ui-sm px-2 py-1.5 text-left text-sm transition-colors",
                          page.slug === activeSlug
                            ? "bg-primary text-primary-fg"
                            : "text-fg hover:bg-secondary",
                        )}
                      >
                        {page.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-sm text-muted">No components match "{filter}".</p>
          )}
        </nav>
      </div>
    </TexturedSurface>
  );
}
