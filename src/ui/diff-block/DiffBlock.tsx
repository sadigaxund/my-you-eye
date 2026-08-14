import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { ScrollArea } from "../scroll-area";
import { tokenize, splitTokensByLine, renderHighlightedLine } from "../code-block/CodeBlock.highlight";
import { wordDiff as wordDiffOf } from "./DiffBlock.wordDiff";
import type { WordDiffSegment } from "./DiffBlock.wordDiff";
import { SplitView } from "./DiffBlock.SplitView";

const diffBlockVariants = cva(
  "w-full overflow-clip rounded-ui border border-border bg-code-bg text-code-fg flex flex-col",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-card",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type DiffLineType = "added" | "removed" | "context";

export interface DiffLine {
  type: DiffLineType;
  /** Line content, without the leading +/-/space marker. */
  content: string;
  /** Line number in the old file. Absent for `"added"` lines. */
  oldLine?: number;
  /** Line number in the new file. Absent for `"removed"` lines. */
  newLine?: number;
}

export interface DiffBlockProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof diffBlockVariants> {
  lines: DiffLine[];
  language?: string;
  header?: string;
  /** "unified" (default): single column with +/- markers. "split": two-column side-by-side. */
  mode?: "unified" | "split";
  /** Syntax-highlight line content via CodeBlock's tokenizer (js/ts/json/bash/css/html/py/yaml/sql). */
  highlight?: boolean;
  /**
   * Word-level intra-line diff for a removed line immediately followed by an
   * added line (a 1:1 changed pair). Runs of multiple removed/added lines
   * are paired by position within the run (min(removed,added) pairs get
   * word-diff; any leftover lines render as plain whole-line highlights) —
   * see DiffBlock.wordDiff.ts.
   */
  wordDiff?: boolean;
}

/** One rendered row: a changed pair has both sides; an unpaired removed/added
 * line or a context line has only the relevant side(s) filled. */
export interface DiffRow {
  left?: DiffLine;
  right?: DiffLine;
}

/** Groups a flat DiffLine[] into rows: context lines pass through 1:1; a run
 * of removed lines followed by a run of added lines pairs positionally
 * (index k of the removed run with index k of the added run), which is also
 * exactly unified order when flattened left-then-right per row. */
export function pairDiffLines(lines: DiffLine[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.type === "context") { rows.push({ left: line, right: line }); i++; continue; }
    const removed: DiffLine[] = [];
    while (i < lines.length && lines[i].type === "removed") { removed.push(lines[i]); i++; }
    const added: DiffLine[] = [];
    while (i < lines.length && lines[i].type === "added") { added.push(lines[i]); i++; }
    const max = Math.max(removed.length, added.length);
    for (let k = 0; k < max; k++) rows.push({ left: removed[k], right: added[k] });
  }
  return rows;
}

const WORD_BG: Record<"old" | "new", string> = {
  old: "bg-danger/25 rounded-ui-sm",
  new: "bg-success/25 rounded-ui-sm",
};

/** Renders one line's content — either word-diff segments, syntax-tokenized
 * spans (reusing CodeBlock's tokenizer), or plain text, in that priority. */
export function LineContent({
  content, language, highlight, segments, side,
}: { content: string; language?: string; highlight?: boolean; segments?: WordDiffSegment[]; side?: "old" | "new" }) {
  if (segments) {
    return (
      <>
        {segments.map((seg, i) => (seg.changed
          ? <span key={i} className={WORD_BG[side ?? "new"]}>{seg.text}</span>
          : <span key={i}>{seg.text}</span>))}
      </>
    );
  }
  if (highlight) {
    const tokens = tokenize(content, language);
    if (tokens) {
      const perLine = splitTokensByLine(tokens);
      return renderHighlightedLine(perLine[0] ?? []);
    }
  }
  return <>{content || " "}</>;
}

export const ROW_BG: Record<DiffLineType, string> = {
  added: "bg-success/10",
  removed: "bg-danger/10",
  context: "",
};
export const MARKER_TEXT: Record<DiffLineType, string> = {
  added: "text-success", removed: "text-danger", context: "text-code-muted",
};
export const MARKER_BORDER: Record<DiffLineType, string> = {
  added: "border-success", removed: "border-danger", context: "border-transparent",
};
export const MARKER_GLYPH: Record<DiffLineType, string> = { added: "+", removed: "-", context: " " };

/**
 * Every cell in a diff row — line numbers, the +/- marker, the code — must
 * carry this. The row is a flex container, so a cell whose line box is
 * shorter than the row's stretches to the row height but paints its glyph at
 * the TOP of that box. `text-xs` alone gives a 16px line box while the code
 * column's `leading-relaxed` gives ~19.5px, so the markers and line numbers
 * sat ~2px high against the code beside them (owner: "the '+' and '-' is
 * still not properly center aligned within the row, it feels kind of on the
 * upper side"). Matching the line-height is what actually aligns them:
 * identical font-size + identical line-height puts the cells on a shared
 * baseline, which vertical centring would only approximate.
 */
export const ROW_LEADING = "leading-relaxed";

function UnifiedRow({ line, language, highlight, segments, side }: {
  line: DiffLine; language?: string; highlight?: boolean; segments?: WordDiffSegment[]; side?: "old" | "new";
}) {
  return (
    <div className={cn("flex", ROW_BG[line.type])}>
      <span className={cn("sticky left-0 z-10 flex shrink-0 font-mono text-xs text-code-muted tabular-nums select-none", ROW_LEADING, ROW_BG[line.type] || "bg-code-bg")}>
        <span className="w-9 text-right pr-1.5">{line.oldLine ?? ""}</span>
        <span className="w-9 text-right pr-1.5">{line.newLine ?? ""}</span>
      </span>
      <span className={cn("shrink-0 w-5 text-center border-l-2 font-mono text-xs", ROW_LEADING, MARKER_BORDER[line.type], MARKER_TEXT[line.type])}>
        {MARKER_GLYPH[line.type]}
      </span>
      <span className="px-2 whitespace-pre font-mono text-xs leading-relaxed">
        <LineContent content={line.content} language={language} highlight={highlight} segments={segments} side={side} />
      </span>
    </div>
  );
}

function UnifiedView({ rows, language, highlight, wordDiff: wd }: {
  rows: DiffRow[]; language?: string; highlight?: boolean; wordDiff?: boolean;
}) {
  return (
    <>
      {rows.map((row, i) => {
        const isPair = wd && row.left && row.right && row.left.type === "removed" && row.right.type === "added";
        const diff = isPair ? wordDiffOf(row.left!.content, row.right!.content) : undefined;
        return (
          <div key={i}>
            {row.left && <UnifiedRow line={row.left} language={language} highlight={highlight} segments={diff?.oldSegments} side="old" />}
            {row.right && row.right !== row.left && <UnifiedRow line={row.right} language={language} highlight={highlight} segments={diff?.newSegments} side="new" />}
          </div>
        );
      })}
    </>
  );
}

const DiffBlock = forwardRef<HTMLDivElement, DiffBlockProps>(
  ({ className, variant, lines, language, header, mode = "unified", highlight = false, wordDiff: wd = false, ...props }, ref) => {
    const rows = pairDiffLines(lines);
    return (
      <div ref={ref} className={cn(diffBlockVariants({ variant }), className)} {...props}>
        {header && (
          <div className="flex items-center gap-2 h-9 px-panel border-b border-border shrink-0">
            <span className="text-xs font-medium text-code-fg truncate">{header}</span>
            {language && (
              <span className="shrink-0 rounded-ui-sm bg-code-bg/80 px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide text-code-muted border border-border/50">
                {language}
              </span>
            )}
          </div>
        )}
        <ScrollArea orientation="both" className="flex-1 min-h-0 py-1.5">
          {mode === "unified"
            ? <UnifiedView rows={rows} language={language} highlight={highlight} wordDiff={wd} />
            : <SplitView rows={rows} language={language} highlight={highlight} wordDiff={wd} />}
        </ScrollArea>
      </div>
    );
  },
);
DiffBlock.displayName = "DiffBlock";

export { DiffBlock, diffBlockVariants };
