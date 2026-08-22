import { forwardRef, useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "../dialog";
import { ScrollArea } from "../scroll-area";
import { cn } from "../../lib/cn";

export interface CommandAction {
  id: string;
  label: string;
  keywords?: string[];
  icon?: React.ReactNode;
  shortcut?: string;
}

export interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actions: CommandAction[];
  onSelect: (action: CommandAction) => void;
  placeholder?: string;
  emptyText?: string;
  groups?: { label: string; actionIds: string[] }[];
}

export const CommandPalette = forwardRef<HTMLDivElement, CommandPaletteProps>(
  function CommandPalette(
    { open, onOpenChange, actions, onSelect, placeholder = "Search commands...", emptyText = "No results found", groups },
    ref,
  ) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () =>
      actions.filter((a) => {
        const q = query.toLowerCase();
        return (
          a.label.toLowerCase().includes(q) ||
          (a.keywords && a.keywords.some((k) => k.toLowerCase().includes(q)))
        );
      }),
    [actions, query],
  );

  // Keyboard contract completion (#32): the active item follows ArrowUp/Down
  // visually too, even deep in a long filtered list.
  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIdx, query]);

  const groupedFiltered = useMemo(() => {
    if (!groups) return null;
    const filteredIds = new Set(filtered.map((a) => a.id));
    return groups
      .map((g) => ({
        ...g,
        actions: g.actionIds
          .map((id) => actions.find((a) => a.id === id)!)
          .filter((a) => a && filteredIds.has(a.id)),
      }))
      .filter((g) => g.actions.length > 0);
  }, [groups, filtered, actions]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[activeIdx]) {
        e.preventDefault();
        onSelect(filtered[activeIdx]);
        onOpenChange(false);
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    },
    [filtered, activeIdx, onSelect, onOpenChange],
  );

  const flatItems = groupedFiltered
    ? groupedFiltered.flatMap((g) => g.actions)
    : filtered;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div ref={ref}>
      <DialogContent size="lg" className="p-0 overflow-hidden gap-0">
        <div className="border-b border-border">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted"
          />
        </div>
        {/* rounded-b-[inherit]: this ScrollArea sits flush against
            DialogContent's rounded bottom corners (DialogContent is
            overflow-hidden via the className override above). Matching its
            own radius to the inherited one keeps its scrollbar's clip in
            sync with the curve instead of a mismatched ancestor clip cutting
            across it. See AGENTS.md §0.10 / TODO.md A4. */}
        {/* Live-region contract (#32): the filtered count is announced
            politely as the query changes — WIG's dynamic-update rule. The
            query lives in internal state, so this must be internal too;
            consumers get it for free. */}
        <p role="status" aria-live="polite" className="sr-only">
          {`${flatItems.length} result${flatItems.length === 1 ? "" : "s"}`}
        </p>
        <ScrollArea className="max-h-80 rounded-b-[inherit]">
          <div ref={listRef} className="p-2" onKeyDown={handleKeyDown}>
          {flatItems.length === 0 ? (
            <p className="px-2 py-8 text-sm text-muted text-center">{emptyText}</p>
          ) : groupedFiltered ? (
            groupedFiltered.map((group) => (
              <div key={group.label}>
                <p className="px-2 py-1 text-xs font-semibold text-muted uppercase tracking-wider">
                  {group.label}
                </p>
                {group.actions.map((action) => {
                  const idx = flatItems.indexOf(action);
                  return (
                    <CommandItem
                      key={action.id}
                      action={action}
                      active={idx === activeIdx}
                      onSelect={() => {
                        onSelect(action);
                        onOpenChange(false);
                      }}
                      onMouseEnter={() => setActiveIdx(idx)}
                    />
                  );
                })}
              </div>
            ))
          ) : (
            filtered.map((action, idx) => (
              <CommandItem
                key={action.id}
                action={action}
                active={idx === activeIdx}
                onSelect={() => {
                  onSelect(action);
                  onOpenChange(false);
                }}
                onMouseEnter={() => setActiveIdx(idx)}
              />
            ))
          )}
        </div>
        </ScrollArea>
      </DialogContent>
    </div>
    </Dialog>
  );
},
);
CommandPalette.displayName = "CommandPalette";

function CommandItem({
  action,
  active,
  onSelect,
  onMouseEnter,
}: {
  action: CommandAction;
  active: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      type="button"
      data-active={active ? "true" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-ui-sm px-2 py-1.5 text-sm text-left",
        active ? "bg-secondary text-secondary-fg" : "text-fg",
      )}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
    >
      {action.icon && <span className="shrink-0 size-4 text-muted">{action.icon}</span>}
      <span className="flex-1 truncate">{action.label}</span>
      {action.shortcut && (
        <span className="shrink-0 text-xs text-muted">{action.shortcut}</span>
      )}
    </button>
  );
}
