// One rendered row of CodeDiff, as its own component so each row's
// `useProgress()` call is a legitimate per-instance hook call (mirroring how
// `Stagger` maps children to individual `<Reveal>` elements rather than
// calling a hook inside a loop within one component).

import { useMemo } from "react";
import { cn } from "../../lib/cn";
import { useProgress } from "../../motion/core";
import { wordDiff } from "../../ui/diff-block";
import type { DiffRow } from "../../ui/diff-block";
import { tokenize, splitTokensByLine, renderHighlightedLine } from "../../ui/code-block/CodeBlock.highlight";

const MARKER_GLYPH = { added: "+", removed: "-", context: " " } as const;
const MARKER_TEXT = { added: "text-success", removed: "text-danger", context: "text-code-muted" } as const;
const ROW_BG = { added: "bg-success/10", removed: "bg-danger/10", context: "" } as const;
const WORD_BG = { old: "bg-danger/25 rounded-ui-sm", new: "bg-success/25 rounded-ui-sm" } as const;

/** Renders one line's content, reusing CodeBlock's own tokenizer for syntax
 * color when a `language` is given — the same reuse `DiffBlock.LineContent` uses. */
function LineText({ content, language }: { content: string; language?: string }) {
  const rendered = useMemo(() => {
    if (!language) return null;
    const tokens = tokenize(content, language);
    if (!tokens) return null;
    const perLine = splitTokensByLine(tokens);
    return renderHighlightedLine(perLine[0] ?? []);
  }, [content, language]);
  return <>{rendered ?? (content || " ")}</>;
}

export interface CodeDiffRowProps {
  row: DiffRow;
  language?: string;
  /** This row's own entrance delay within the diff's timeline, in frames — computed by CodeDiff as a per-row stagger offset. */
  delayFrames: number;
  durationFrames: number;
  /** Measured single-line height in px (0 until the ruler in CodeDiff has measured), used to grow/collapse added/removed rows. */
  lineHeight: number;
}

/**
 * One diff row: a context line renders statically; an added-only line grows
 * in (height + opacity, from `useProgress()` — the same 0→1 primitive every
 * motion component reads); a removed-only line collapses out the same way,
 * reversed; a changed pair (a removed line immediately followed by an added
 * line — `pairDiffLines`' definition of "paired") cross-fades between old
 * and new via two absolutely-stacked layers, each word-diffed with
 * `wordDiff` so only the changed tokens are called out.
 */
export function CodeDiffRow({ row, language, delayFrames, durationFrames, lineHeight }: CodeDiffRowProps) {
  const progress = useProgress({ delay: delayFrames, duration: durationFrames });
  const isChanged = Boolean(row.left && row.right && row.left !== row.right);
  const isAddedOnly = Boolean(row.right && !row.left);
  const isRemovedOnly = Boolean(row.left && !row.right);

  if (isChanged) {
    const diff = wordDiff(row.left!.content, row.right!.content);
    return (
      <div className="relative">
        <div
          className={cn("flex px-2 font-mono text-xs leading-relaxed whitespace-pre", ROW_BG.removed)}
          style={{ opacity: 1 - progress }}
        >
          <span className={cn("w-5 shrink-0 text-center", MARKER_TEXT.removed)}>{MARKER_GLYPH.removed}</span>
          {diff.oldSegments.map((seg, i) => (
            <span key={i} className={seg.changed ? WORD_BG.old : undefined}>{seg.text}</span>
          ))}
        </div>
        <div
          className={cn("absolute inset-0 flex px-2 font-mono text-xs leading-relaxed whitespace-pre", ROW_BG.added)}
          style={{ opacity: progress }}
        >
          <span className={cn("w-5 shrink-0 text-center", MARKER_TEXT.added)}>{MARKER_GLYPH.added}</span>
          {diff.newSegments.map((seg, i) => (
            <span key={i} className={seg.changed ? WORD_BG.new : undefined}>{seg.text}</span>
          ))}
        </div>
      </div>
    );
  }

  if (isAddedOnly) {
    return (
      <div
        className={cn("flex px-2 font-mono text-xs leading-relaxed whitespace-pre overflow-hidden", ROW_BG.added)}
        style={{ opacity: progress, height: lineHeight > 0 ? lineHeight * progress : undefined }}
      >
        <span className={cn("w-5 shrink-0 text-center", MARKER_TEXT.added)}>{MARKER_GLYPH.added}</span>
        <LineText content={row.right!.content} language={language} />
      </div>
    );
  }

  if (isRemovedOnly) {
    return (
      <div
        className={cn("flex px-2 font-mono text-xs leading-relaxed whitespace-pre overflow-hidden", ROW_BG.removed)}
        style={{ opacity: 1 - progress, height: lineHeight > 0 ? lineHeight * (1 - progress) : undefined }}
      >
        <span className={cn("w-5 shrink-0 text-center", MARKER_TEXT.removed)}>{MARKER_GLYPH.removed}</span>
        <LineText content={row.left!.content} language={language} />
      </div>
    );
  }

  const line = (row.left ?? row.right)!;
  return (
    <div className="flex px-2 font-mono text-xs leading-relaxed whitespace-pre">
      <span className={cn("w-5 shrink-0 text-center", MARKER_TEXT.context)}>{MARKER_GLYPH.context}</span>
      <LineText content={line.content} language={language} />
    </div>
  );
}
