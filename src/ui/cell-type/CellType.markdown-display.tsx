import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { ScrollArea } from "../scroll-area";
import { Markdown, renderInline } from "../markdown";
import { useTruncated, ExpandIndicator, EXPAND_POPOVER_STYLE } from "./CellType.shared";

// The "markdown" cell type reuses the repo's existing Markdown renderer
// (src/ui/markdown) rather than hand-rolling a second one — AGENTS.md §1
// Step A. The collapsed cell preview uses `renderInline` (bold/italic/code
// spans/links only, single line) instead of the full block-aware
// `<Markdown>` component: a table/list cell is one line, and block
// elements (headings, code fences, tables) don't have a sensible
// single-line rendering. The expanded popover switches to the full
// `<Markdown>` so block structure (a code fence, a table) is visible once
// there's room for it.
export function MarkdownDisplay({ value }: { value: unknown }) {
  const source = String(value);
  const firstLine = source.split("\n")[0];
  const [previewRef, isTruncated] = useTruncated<HTMLSpanElement>([value]);
  // Multi-line markdown source always has more than the first-line inline
  // preview shows (a heading, a list, a second paragraph…), so the
  // indicator isn't gated on isTruncated alone — same reasoning CodeDisplay
  // uses for multi-line code.
  const hasMore = isTruncated || source.includes("\n");

  return (
    <Popover>
      <PopoverTrigger className="text-xs cursor-pointer hover:text-primary transition-colors flex w-full max-w-full min-w-0 items-center gap-1.5">
        <span ref={previewRef} className="block min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left">
          {renderInline(firstLine)}
        </span>
        {hasMore && <ExpandIndicator />}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="overflow-hidden" style={EXPAND_POPOVER_STYLE}>
        <ScrollArea className="max-h-72">
          <Markdown content={source} />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
