import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { ScrollArea } from "../scroll-area";
import { Badge } from "../badge";
import { CodeBlock } from "../code-block";
import { useTruncated, ExpandIndicator, EXPAND_POPOVER_STYLE } from "./CellType.shared";

// Split out of CellType.complex-displays.tsx (which was pushing past the
// 250-line lint guideline) rather than folded into a shared "misc" grab-bag —
// AGENTS.md §0.3 wants a genuine split, not a dumping ground. ArrayDisplay
// has no dependency on JsonDisplay/TreeDisplay beyond the shared indicator/
// popover-sizing helpers, so it splits cleanly.

// One line per item, nested values serialized inline as compact JSON. This
// intentionally throws away the earlier per-item CellType/DataList/Badge
// rendering — that format had three problems the owner called out: (a)
// per-item index labels + Badge chrome were noise, (b) nothing was
// copyable, (c) 10+ items produced a long scroll of tall DataList rows, and
// (d) an object/array item became its own nested expandable drawer inside
// this popover's drawer. Plain text with one item per line fixes (a)/(b)/(d)
// simultaneously (no index, no badge, nothing left to recurse into — a
// nested object is just a JSON string on its own line) and turns (c) into a
// plain max-height on the scroll container, same as JsonDisplay/TreeDisplay.
function serializeArrayItem(item: unknown): string {
  if (item === null || item === undefined) return "null";
  if (typeof item === "string") return item;
  if (typeof item === "number" || typeof item === "boolean") return String(item);
  try {
    return JSON.stringify(item);
  } catch {
    return String(item);
  }
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
            <Badge variant="neutral" tone="soft" className="text-xs px-1 py-0 leading-none shrink-0">
              {count} items
            </Badge>
            <span
              ref={previewRef}
              className="block min-w-0 overflow-hidden whitespace-nowrap text-secondary-fg"
            >
              {arr.map((item, i) => (
                <span key={i}>{i > 0 && <span className="text-muted">, </span>}{serializeArrayItem(item)}</span>
              ))}
            </span>
            {/* Always expandable — the popover shows every item's real
                value, which the comma-joined preview never fully captures
                even when it isn't visually clipped. */}
            <ExpandIndicator />
          </>
        )}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="p-0 overflow-hidden" style={EXPAND_POPOVER_STYLE}>
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-xs text-muted">List ({count})</span>
        </div>
        <ScrollArea className="max-h-72">
          {/* `bare` + no `language`/`header`: just a hover-revealed copy
              button over plain monospaced text, reusing CodeBlock's own
              copy affordance instead of hand-rolling a second one (checked
              first per AGENTS.md §1 Step A — this is the same mechanism
              JsonDisplay already uses for its popover). */}
          <CodeBlock code={arr.map(serializeArrayItem).join("\n")} bare />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
