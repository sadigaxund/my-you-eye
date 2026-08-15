import { forwardRef, useState, useMemo, useRef, useEffect, useId } from "react";
import type { KeyboardEvent } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { Input } from "../input";
import { ScrollArea } from "../scroll-area";
import { Badge } from "../badge";
import { Checkbox } from "../checkbox";
import { cn } from "../../lib/cn";

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  /** Controlled selection. Pass `onChange` with it. Omit for uncontrolled use. */
  value?: string[];
  /** Initial selection for uncontrolled use. Ignored when `value` is provided. */
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  function MultiSelect(
    { options, value, defaultValue, onChange, placeholder = "Select...", emptyText = "No results found", className, disabled },
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
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const isControlled = value !== undefined;
  const selected = isControlled ? value : internalValue;

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  const toggle = (optionValue: string) => {
    const next = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue];
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  const selectedLabels = options.filter((o) => selected.includes(o.value));

  const activeId = filtered.length > 0 ? `${listId}-opt-${activeIndex}` : undefined;

  // Opening resets the active option to the top of the list. Deliberately
  // keyed on `open` alone: `filtered` is a fresh array whenever the caller
  // passes an inline `options` literal, so depending on it would reset — and
  // undo arrow-key navigation — on every render. Typing resets it from the
  // input's own onChange instead, and an out-of-range index is inert
  // (`filtered[activeIndex]` is simply undefined).
  useEffect(() => {
    if (open) setActiveIndex(0);
  }, [open]);

  useEffect(() => {
    if (!open || !activeId) return;
    listRef.current?.querySelector(`#${CSS.escape(activeId)}`)?.scrollIntoView({ block: "nearest" });
  }, [open, activeId]);

  const move = (delta: number) => {
    if (filtered.length === 0) return;
    setActiveIndex((i) => (i + delta + filtered.length) % filtered.length);
  };

  // Enter toggles without closing — multi-select's whole point is picking
  // several in a row; Escape is how you're done.
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
        toggle(option.value);
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
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listId}
          disabled={disabled}
          ref={ref}
          className={cn(
            "flex w-full items-center gap-1 flex-wrap rounded-ui border border-border bg-bg px-3 py-2 text-sm text-left ring-offset-bg min-h-10",
            "focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-inset",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selectedLabels.length === 0 && "text-muted",
            className,
          )}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
        >
          {selectedLabels.length === 0 ? (
            placeholder
          ) : selectedLabels.length <= 3 ? (
            selectedLabels.map((opt) => (
              <Badge key={opt.value} variant="neutral" tone="soft">{opt.label}</Badge>
            ))
          ) : (
            <>
              {selectedLabels.slice(0, 2).map((opt) => (
                <Badge key={opt.value} variant="neutral" tone="soft">{opt.label}</Badge>
              ))}
              <Badge variant="neutral" tone="soft">+{selectedLabels.length - 2}</Badge>
            </>
          )}
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
          <div className="p-1" ref={listRef} role="listbox" aria-multiselectable id={listId}>
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-sm text-muted text-center">{emptyText}</p>
            ) : (
              filtered.map((option, i) => (
                <label
                  key={option.value}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={selected.includes(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-ui-sm text-sm hover:bg-secondary cursor-pointer",
                    i === activeIndex && "bg-secondary",
                  )}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  <Checkbox
                    checked={selected.includes(option.value)}
                    onCheckedChange={() => toggle(option.value)}
                  />
                  {option.label}
                </label>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
},
);
MultiSelect.displayName = "MultiSelect";
