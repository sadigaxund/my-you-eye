import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { ScrollArea } from "../../ui/scroll-area";
import { codeBlockVariants, CodeHeaderBar } from "../../ui/code-block";
import { pairDiffLines } from "../../ui/diff-block";
import { useTimeline, resolveBeatFrames } from "../../motion/core";
import type { Timing } from "../../motion/core";
import { linesDiff } from "./CodeDiff.lines";
import { CodeDiffRow } from "./CodeDiff.Row";

export type CodeDiffProps = Timing & {
  /** Source as it was before this diff. */
  from: string;
  /** Source after this diff. */
  to: string;
  language?: string;
  /** Filename shown in the header tab, matching CodeBlock's header. */
  header?: string;
  className?: string;
};

// Sample length for the char-width ruler, same technique (and constant) as
// CodeBlock's own substring-highlight ruler (CodeBlock.useHighlightOverlay)
// — scrollWidth over many repeated characters divided by the count, rather
// than offsetWidth on a single character, avoids rounding error.
const CHAR_RULER_LEN = 40;

/** Every row shares one measured line height AND one measured monospace
 * character width (all rows use the same font/leading, so one reference
 * measurement covers all of them) — the same "measure real geometry instead
 * of a hardcoded metric" discipline CodeBlock's own substring-highlight
 * overlay uses (AGENTS.md TODO A1), applied here to size the grow/collapse
 * animation on added/removed rows AND to position the merged word-diff
 * highlight outline (CodeDiff.Row.tsx) in real pixels.
 *
 * Two separate rulers, not one: the height ruler carries `px-panel` so its
 * offsetHeight matches a real row's line box, but that same horizontal
 * padding would corrupt a width measurement (offsetWidth would include the
 * padding box, not just the "0" glyph) — so char width comes from its own
 * `size-0 overflow-hidden` ruler with no padding, reading `scrollWidth`
 * instead, exactly like CodeBlock's ruler. */
function useLineMetrics(): {
  heightRef: React.RefObject<HTMLDivElement | null>;
  widthRef: React.RefObject<HTMLSpanElement | null>;
  height: number;
  charWidth: number;
} {
  const heightRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef<HTMLSpanElement>(null);
  const [height, setHeight] = useState(0);
  const [charWidth, setCharWidth] = useState(0);
  useLayoutEffect(() => {
    const heightEl = heightRef.current;
    const widthEl = widthRef.current;
    if (!heightEl || !widthEl) return undefined;
    const measure = () => {
      setHeight((h) => (h === heightEl.offsetHeight ? h : heightEl.offsetHeight));
      const w = widthEl.scrollWidth / CHAR_RULER_LEN;
      setCharWidth((prev) => (prev === w ? prev : w));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(heightEl);
    observer.observe(widthEl);
    return () => observer.disconnect();
  }, []);
  return { heightRef, widthRef, height, charWidth };
}

/**
 * Animates between two full sources inside a `CodeBlock`-styled frame
 * (TODO.md Phase E §6 / D4): added rows grow in, removed rows collapse out,
 * changed rows cross-fade word-by-word. Scenes-tier, not a motion primitive
 * — it knows about `CodeBlock`'s chrome and `DiffBlock`'s row/diff
 * vocabulary, which `src/motion/` is not allowed to depend on (AGENTS.md
 * §9b). `CodeScene` renders this for any step whose `code` differs from
 * what was on screen before it; it is also usable standalone (see the
 * showcase) for any before/after code transition.
 *
 * The line-level diff comes from `linesDiff` (CodeDiff.lines.ts), which runs
 * the exact same LCS `wordDiff` uses (`lcsDiffFlags`) over lines instead of
 * words — there is exactly one diff algorithm in the library. Row grouping
 * reuses `pairDiffLines` from `src/ui/diff-block` unchanged.
 */
export function CodeDiff({ from, to, language, header, className, ...timing }: CodeDiffProps) {
  const { fps } = useTimeline();
  const rows = useMemo(() => pairDiffLines(linesDiff(from, to)), [from, to]);
  const { heightRef, widthRef, height: lineHeight, charWidth } = useLineMetrics();

  const baseDelay = timing.delay != null ? resolveBeatFrames(timing.delay, fps) : 0;
  const totalDuration = Math.max(1, resolveBeatFrames(timing.duration ?? "normal", fps));
  // Every row gets its own slice of the total window, animating over roughly
  // half of it — so a row that starts late still has time to finish inside
  // `totalDuration`, and every row is done by the time the step's own
  // duration (the caller's `timing.duration`) elapses.
  const rowDuration = Math.max(1, Math.round(totalDuration * 0.6));
  const eachFrames = rows.length > 1 ? Math.max(1, Math.round((totalDuration - rowDuration) / (rows.length - 1))) : 0;

  return (
    <div className={cn(codeBlockVariants(), "w-full text-code-fg", className)}>
      {header && <CodeHeaderBar header={header} language={language} />}
      <ScrollArea orientation="both" className="flex-1 min-h-0 py-panel">
        <div ref={heightRef} aria-hidden className="invisible absolute px-panel font-mono text-xs leading-relaxed whitespace-pre">
          0
        </div>
        <span ref={widthRef} aria-hidden className="invisible absolute size-0 overflow-hidden whitespace-pre font-mono text-xs leading-relaxed">
          {"0".repeat(CHAR_RULER_LEN)}
        </span>
        {rows.map((row, i) => (
          <CodeDiffRow
            key={i}
            row={row}
            language={language}
            delayFrames={baseDelay + i * eachFrames}
            durationFrames={rowDuration}
            lineHeight={lineHeight}
            charWidth={charWidth}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
