import { cn } from "../../lib/cn";
import { LineContent, ROW_BG, ROW_LEADING, MARKER_TEXT, MARKER_BORDER, MARKER_GLYPH } from "./DiffBlock";
import type { DiffLine, DiffRow } from "./DiffBlock";
import { wordDiff } from "./DiffBlock.wordDiff";
import type { WordDiffSegment } from "./DiffBlock.wordDiff";

function SideCell({ line, language, highlight, segments, side }: {
  line?: DiffLine; language?: string; highlight?: boolean; segments?: WordDiffSegment[]; side: "old" | "new";
}) {
  if (!line) {
    return (
      <div className="flex flex-1 min-w-0 bg-secondary/20">
        <span className="w-9 shrink-0" />
        <span className="w-5 shrink-0" />
      </div>
    );
  }
  const lineNo = side === "old" ? line.oldLine : line.newLine;
  return (
    <div className={cn("flex flex-1 min-w-0", ROW_BG[line.type])}>
      <span className={cn("w-9 shrink-0 text-right pr-1.5 font-mono text-xs text-code-muted tabular-nums select-none", ROW_LEADING, ROW_BG[line.type] || "bg-code-bg")}>
        {lineNo ?? ""}
      </span>
      <span className={cn("shrink-0 w-5 text-center border-l-2 font-mono text-xs", ROW_LEADING, MARKER_BORDER[line.type], MARKER_TEXT[line.type])}>
        {MARKER_GLYPH[line.type]}
      </span>
      <span className="min-w-0 flex-1 px-2 whitespace-pre font-mono text-xs leading-relaxed">
        <LineContent content={line.content} language={language} highlight={highlight} segments={segments} side={side} />
      </span>
    </div>
  );
}

/** Two-column before/after view. A changed pair (one removed + one added
 * line in the same row) gets word-level diff highlighting when `wordDiff`
 * is on; unpaired or context rows render each side independently. */
export function SplitView({ rows, language, highlight, wordDiff: wd }: {
  rows: DiffRow[]; language?: string; highlight?: boolean; wordDiff?: boolean;
}) {
  return (
    <div className="min-w-fit">
      {rows.map((row, i) => {
        const isPair = wd && row.left && row.right && row.left.type === "removed" && row.right.type === "added";
        const diff = isPair ? wordDiff(row.left!.content, row.right!.content) : undefined;
        return (
          <div key={i} className="flex">
            <SideCell line={row.left} language={language} highlight={highlight} segments={diff?.oldSegments} side="old" />
            <div className="w-px shrink-0 bg-border" />
            <SideCell line={row.right} language={language} highlight={highlight} segments={diff?.newSegments} side="new" />
          </div>
        );
      })}
    </div>
  );
}
