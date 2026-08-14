import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { ScrollArea } from "../scroll-area";
import { Badge } from "../badge";
import { DataList } from "../data-list";
import { useTruncated, ExpandIndicator, EXPAND_POPOVER_STYLE } from "./CellType.shared";
import type { CellValueType } from "./CellType";

// Split out of CellType.complex-displays.tsx (which was pushing past the
// 250-line lint guideline) rather than folded into a shared "misc" grab-bag —
// AGENTS.md §0.3 wants a genuine split, not a dumping ground. ArrayDisplay
// has no dependency on JsonDisplay/TreeDisplay beyond the shared indicator/
// popover-sizing helpers, so it splits cleanly.

// Maps each array item to a DataList row value/type — primitives keep
// their own CellType rendering (numbers, booleans stay typed rather than
// stringified), anything else (nested objects/arrays) falls back to a
// stringified "badge" pill, matching what String(item) rendered before.
function arrayItemValue(item: unknown): string | number | boolean | null {
  if (item === null || item === undefined) return null;
  if (typeof item === "number" || typeof item === "boolean" || typeof item === "string") return item;
  return String(item);
}
function arrayItemType(item: unknown): CellValueType {
  if (item === null || item === undefined) return "null";
  if (typeof item === "number") return "number";
  if (typeof item === "boolean") return "boolean";
  return "badge";
}

export function ArrayDisplay({ value }: { value: unknown }) {
  const arr = Array.isArray(value) ? value : [];
  const count = arr.length;

  // Truncation detection isn't needed for gating the indicator (it's
  // unconditional, see below) but the ref still drives the preview span's
  // overflow clipping.
  const [previewRef] = useTruncated<HTMLSpanElement>([value]);

  return (
    <Popover>
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors flex w-full max-w-full min-w-0 items-center gap-1.5">
        {count === 0 ? (
          <span className="text-muted italic">empty</span>
        ) : (
          <>
            <Badge variant="neutral" style="soft" className="text-xs px-1 py-0 leading-none shrink-0">
              {count} items
            </Badge>
            <span
              ref={previewRef}
              className="block min-w-0 overflow-hidden whitespace-nowrap text-secondary-fg"
            >
              {arr.map((item, i) => (
                <span key={i}>{i > 0 && <span className="text-muted">, </span>}{String(item)}</span>
              ))}
            </span>
            {/* Always expandable — the popover shows every item's real
                CellType rendering, which the comma-joined preview never
                fully captures even when it isn't visually clipped. */}
            <ExpandIndicator />
          </>
        )}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="p-0 overflow-hidden" style={EXPAND_POPOVER_STYLE}>
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-xs text-muted">List ({count})</span>
        </div>
        <ScrollArea className="max-h-72">
          {/* Reuses DataList instead of a hand-rolled pill list (AGENTS.md
              §1 Step A) — each item gets an index label so it's still a
              proper label/value row, not just a bare list of badges. */}
          <DataList
            density="compact"
            labelWidth="sm"
            items={arr.map((item, i) => ({
              label: `[${i}]`,
              value: arrayItemValue(item),
              type: arrayItemType(item),
              badgeVariant: "neutral",
              badgeStyle: "soft",
            }))}
          />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
