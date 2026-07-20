import { forwardRef, useState, useMemo, useRef } from "react";
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
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export const Combobox = forwardRef<HTMLButtonElement, ComboboxProps>(
  function Combobox(
    { options, value, onChange, placeholder = "Search...", emptyText = "No results found", className, disabled },
    ref,
  ) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
      <PopoverTrigger asChild>
        <button
          ref={ref}
          type="button"
          role="combobox"
          disabled={disabled}
          className={cn(
            "flex w-full items-center justify-between rounded-ui border border-border bg-bg px-3 py-2 text-sm text-left ring-offset-bg",
            "focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !selectedLabel && "text-muted",
            className,
          )}
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            variant="filled"
            className="border-0 rounded-none ring-0 focus-visible:ring-0"
          />
        </div>
        <ScrollArea className="max-h-60">
          <div className="p-1">
            {filtered.length === 0 ? (
              <p className="px-2 py-4 text-sm text-muted text-center">{emptyText}</p>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-ui-sm text-sm hover:bg-secondary focus:bg-secondary outline-none",
                    option.value === value && "bg-primary/10 text-primary font-medium",
                  )}
                  onClick={() => {
                    onChange?.(option.value);
                    setOpen(false);
                    setQuery("");
                  }}
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
