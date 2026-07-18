import { useState, useMemo, useRef } from "react";
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
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = "Select...",
  emptyText = "No results found",
  className,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query],
  );

  const toggle = (optionValue: string) => {
    const next = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(next);
  };

  const selectedLabels = options.filter((o) => value.includes(o.value));

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex w-full items-center gap-1 flex-wrap rounded-ui border border-border bg-bg px-3 py-2 text-sm text-left ring-offset-bg min-h-[42px]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            selectedLabels.length === 0 && "text-muted",
            className,
          )}
          style={{ backdropFilter: "blur(var(--backdrop-blur))" }}
        >
          {selectedLabels.length === 0 ? (
            placeholder
          ) : selectedLabels.length <= 3 ? (
            selectedLabels.map((opt) => (
              <Badge key={opt.value} variant="neutral" style="soft">{opt.label}</Badge>
            ))
          ) : (
            <>
              {selectedLabels.slice(0, 2).map((opt) => (
                <Badge key={opt.value} variant="neutral" style="soft">{opt.label}</Badge>
              ))}
              <Badge variant="neutral" style="soft">+{selectedLabels.length - 2}</Badge>
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
                <label
                  key={option.value}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-ui-sm text-sm hover:bg-secondary cursor-pointer",
                  )}
                >
                  <Checkbox
                    checked={value.includes(option.value)}
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
}
