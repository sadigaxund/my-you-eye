// One rendered row of CodeDiff, as its own component so each row's
// `useProgress()` call is a legitimate per-instance hook call (mirroring how
// `Stagger` maps children to individual `<Reveal>` elements rather than
// calling a hook inside a loop within one component).

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { useProgress } from "../../motion/core";
import { wordDiff } from "../../ui/diff-block";
import type { DiffRow, WordDiffSegment } from "../../ui/diff-block";
import { tokenize, splitTokensByLine, renderHighlightedLine } from "../../ui/code-block/CodeBlock.highlight";
// Reused rather than re-implemented (owner feedback: "make those more
// intuitive. Maybe you can use the Merged Diff component that we have") —
// CodeBlock's rectilinear-polygon-union outline turns a row of touching
// per-segment highlight boxes into one merged region instead of a strip of
// individually-rounded boxes with visible seams between adjacent segments.
import { MergedHighlight } from "../../ui/code-block/CodeBlock.merged-highlight";
import type { Rect } from "../../ui/code-block/CodeBlock.merged-outline";

const MARKER_GLYPH = { added: "+", removed: "-", context: " " } as const;
const MARKER_TEXT = { added: "text-success", removed: "text-danger", context: "text-code-muted" } as const;
const ROW_BG = { added: "bg-success/10", removed: "bg-danger/10", context: "" } as const;
const WORD_COLOR = { old: "var(--color-danger)", new: "var(--color-success)" } as const;

/** Marker glyph ("+"/"-") column width, measured (not hardcoded) via
 * offsetLeft/offsetWidth — the x-origin every changed-segment Rect is
 * anchored to, so the merged highlight outline lines up with the real
 * rendered text regardless of the row's own padding/marker-column tokens. */
function useAnchorX(): { ref: React.RefObject<HTMLSpanElement | null>; anchorX: number } {
  const ref = useRef<HTMLSpanElement>(null);
  const [anchorX, setAnchorX] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const next = el.offsetLeft + el.offsetWidth;
      setAnchorX((x) => (x === next ? x : next));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, anchorX };
}

/** Turns one side's word-diff segments into the `changed` spans' pixel
 * rects, in the same coordinate space `MergedHighlight`'s SVG overlay
 * covers (the row's nearest positioned ancestor) — adjacent changed
 * segments produce back-to-back rects with identical shared edges, which is
 * exactly what `computeMergedOutline`'s grid decomposition needs to fuse
 * them into one region instead of leaving a seam at the touching boundary. */
function segmentsToRects(segments: WordDiffSegment[], anchorX: number, charWidth: number, height: number): Rect[] {
  const rects: Rect[] = [];
  let x = anchorX;
  for (const seg of segments) {
    const width = seg.text.length * charWidth;
    if (seg.changed && width > 0) rects.push({ x, y: 0, width, height });
    x += width;
  }
  return rects;
}

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
  /** Measured monospace character width in px (0 until CodeDiff's ruler has measured) — sizes the merged word-diff highlight rects on changed rows. */
  charWidth: number;
}

/**
 * One diff row: a context line renders statically; an added-only line grows
 * in (height + opacity, from `useProgress()` — the same 0→1 primitive every
 * motion component reads); a removed-only line collapses out the same way,
 * reversed; a changed pair (a removed line immediately followed by an added
 * line — `pairDiffLines`' definition of "paired") cross-fades between old
 * and new via two absolutely-stacked layers whose fades do not overlap (see
 * the comment on the branch), each word-diffed with `wordDiff` so only the
 * changed tokens are called out.
 */
export function CodeDiffRow({ row, language, delayFrames, durationFrames, lineHeight, charWidth }: CodeDiffRowProps) {
  const progress = useProgress({ delay: delayFrames, duration: durationFrames });
  const isChanged = Boolean(row.left && row.right && row.left !== row.right);
  const isAddedOnly = Boolean(row.right && !row.left);
  const isRemovedOnly = Boolean(row.left && !row.right);

  const { ref: markerRef, anchorX } = useAnchorX();
  // Computed unconditionally (never inside the `isChanged` branch below) so
  // every render of a given row instance calls the same hooks in the same
  // order, even if `row`'s shape ever changed between renders — `diff` is
  // just null on non-changed rows, which segmentsToRects' callers guard on.
  const diff = isChanged ? wordDiff(row.left!.content, row.right!.content) : null;
  const oldRects = useMemo(
    () => (diff ? segmentsToRects(diff.oldSegments, anchorX, charWidth, lineHeight) : []),
    [diff, anchorX, charWidth, lineHeight],
  );
  const newRects = useMemo(
    () => (diff ? segmentsToRects(diff.newSegments, anchorX, charWidth, lineHeight) : []),
    [diff, anchorX, charWidth, lineHeight],
  );

  if (isChanged && diff) {
    // A dissolve, NOT a cross-fade. The two layers are stacked on the same
    // pixels, so any window where both are partly visible paints two
    // different strings of monospace text on top of each other — the row
    // becomes "let sum = 0;bl = items.reduce((sum, item)…", which is
    // unreadable garbage rather than a transition (owner, on the playing
    // CodeScene: "the 'Playing' scene is weird, i dont understand what it
    // tries to convey"). Fading the old line fully OUT before the new one
    // starts coming IN costs one blank beat in the middle and buys a row
    // that is legible at every single frame.
    const oldOpacity = Math.max(0, 1 - progress / 0.45);
    const newOpacity = Math.max(0, (progress - 0.55) / 0.45);
    return (
      <div className="relative">
        <div
          className={cn("flex px-panel font-mono text-xs leading-relaxed whitespace-pre", ROW_BG.removed)}
          style={{ opacity: oldOpacity }}
        >
          <span ref={markerRef} className={cn("w-5 shrink-0 text-center", MARKER_TEXT.removed)}>{MARKER_GLYPH.removed}</span>
          {diff.oldSegments.map((seg) => seg.text).join("")}
          {oldRects.length > 0 && <MergedHighlight rects={oldRects} color={WORD_COLOR.old} strokeColor={WORD_COLOR.old} />}
        </div>
        <div
          className={cn("absolute inset-0 flex px-panel font-mono text-xs leading-relaxed whitespace-pre", ROW_BG.added)}
          style={{ opacity: newOpacity }}
        >
          <span className={cn("w-5 shrink-0 text-center", MARKER_TEXT.added)}>{MARKER_GLYPH.added}</span>
          {diff.newSegments.map((seg) => seg.text).join("")}
          {newRects.length > 0 && <MergedHighlight rects={newRects} color={WORD_COLOR.new} strokeColor={WORD_COLOR.new} />}
        </div>
      </div>
    );
  }

  if (isAddedOnly) {
    return (
      <div
        className={cn("flex px-panel font-mono text-xs leading-relaxed whitespace-pre overflow-hidden", ROW_BG.added)}
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
        className={cn("flex px-panel font-mono text-xs leading-relaxed whitespace-pre overflow-hidden", ROW_BG.removed)}
        style={{ opacity: 1 - progress, height: lineHeight > 0 ? lineHeight * (1 - progress) : undefined }}
      >
        <span className={cn("w-5 shrink-0 text-center", MARKER_TEXT.removed)}>{MARKER_GLYPH.removed}</span>
        <LineText content={row.left!.content} language={language} />
      </div>
    );
  }

  const line = (row.left ?? row.right)!;
  return (
    <div className="flex px-panel font-mono text-xs leading-relaxed whitespace-pre">
      <span className={cn("w-5 shrink-0 text-center", MARKER_TEXT.context)}>{MARKER_GLYPH.context}</span>
      <LineText content={line.content} language={language} />
    </div>
  );
}
