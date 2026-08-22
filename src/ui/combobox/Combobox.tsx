import { forwardRef, useState, useMemo, useRef, useEffect, useId } from "react";
import type { KeyboardEvent } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { Input } from "../input";
import { ScrollArea } from "../scroll-area";
import { cn } from "../../lib/cn";

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  /** Controlled selection. Pass `onChange` with it. Omit for uncontrolled use. */
  value?: string;
  /** Initial selection for uncontrolled use. Ignored when `value` is provided. */
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(
  function Combobox(
    { options, value, defaultValue, onChange, placeholder = "Search...", emptyText = "No results found", className, disabled },
    ref,
  ) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Controlled/uncontrolled fallback, the same shape every other input in the
  // library uses: `value` wins when provided, otherwise internal state does,
  // and `onChange` fires in both modes.
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internalValue;

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  const selectedLabel = options.find((o) => o.value === selected)?.label ?? "";

  // Opening anchors the active option to the current selection. Deliberately
  // keyed on `open` alone: `filtered` is a fresh array whenever the caller
  // passes an inline `options` literal, so depending on it would re-anchor —
  // and undo arrow-key navigation — on every render. Typing re-anchors to 0
  // from the input's own onChange instead.
  useEffect(() => {
    if (!open) return;
    const i = filtered.findIndex((o) => o.value === selected);
    setActiveIndex(i >= 0 ? i : 0);
  }, [open]);

  const activeId = filtered.length > 0 ? `${listId}-opt-${activeIndex}` : undefined;

  useEffect(() => {
    if (!open || !activeId) return;
    listRef.current?.querySelector(`#${CSS.escape(activeId)}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeId]);

  const commit = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    setOpen(false);
    setQuery("");
  };

  const move = (delta: number) => {
    if (filtered.length === 0) return;
    setActiveIndex((i) => (i + delta + filtered.length) % filtered.length);
  };

  const onListKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); move(1); break;
      case "ArrowUp": e.preventDefault(); move(-1); break;
      case "Home": e.preventDefault(); setActiveIndex(0); break;
      case "End": e.preventDefault(); setActiveIndex(Math.max(0, filtered.length - 1)); break;
      case "Enter": {
        const option = filtered[activeIndex];
        if (!option) return;
        e.preventDefault();
        commit(option.value);
        break;
      }
      case "Escape": e.preventDefault(); setOpen(false); setQuery(""); break;
      default: break;
    }
  };

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between rounded-ui border border-border bg-bg px-3 py-2 text-sm text-left ring-offset-bg",
            "focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-inset",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedLabel && "text-muted",
            className,
          )}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        >
          {selectedLabel || placeholder}
          <svg viewBox="0 0 8 8" className="size-3 shrink-0 fill-current opacity-dim">
            <path d="M0 2l4 4 4-4" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0 overflow-hidden"
      >
        <div className="border-b border-border">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={onListKeyDown}
            placeholder={placeholder}
            variant="filled"
            aria-controls={listId}
            aria-activedescendant={activeId}
            className="border-0 rounded-none ring-0 focus-visible:ring-0"
          />
        </div>
        {/* rounded-b-[inherit]: matches PopoverContent's inherited bottom
            radius so this ScrollArea's own scrollbar clips in sync with the
            curve instead of a mismatched ancestor clip. See AGENTS.md §0.10. */}
        <ScrollArea className="max-h-60 rounded-b-[inherit]">
          <div className="p-1" ref={listRef} role="listbox" id={listId}>
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-sm text-muted text-center">{emptyText}</p>
            ) : (
              filtered.map((option, i) => (
                <button
                  key={option.value}
                  id={`${listId}-opt-${i}`}
                  type="button"
                  role="option"
                  aria-selected={option.value === selected}
                  tabIndex={-1}
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-ui-sm text-sm hover:bg-secondary focus:bg-secondary outline-none",
                    i === activeIndex && "bg-secondary",
                    option.value === selected && "bg-primary/10 text-primary font-medium",
                  )}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => commit(option.value)}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
},
);
Combobox.displayName = "Combobox";
