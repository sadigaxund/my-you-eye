import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/cn";
import { ScrollArea } from "../../ui/scroll-area";
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

/** Every row shares one measured line height (all rows use the same
 * font/leading, so one reference measurement covers all of them) — the
 * same "measure real geometry instead of a hardcoded metric" discipline
 * CodeBlock's own substring-highlight overlay uses (AGENTS.md TODO A1),
 * applied here to size the grow/collapse animation on added/removed rows.
 * `absolute` + `invisible` keeps it out of layout and out of sight. */
function useLineHeight(): { ref: React.RefObject<HTMLDivElement | null>; height: number } {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setHeight((h) => (h === el.offsetHeight ? h : el.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, height };
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
  const { ref: rulerRef, height: lineHeight } = useLineHeight();

  const baseDelay = timing.delay != null ? resolveBeatFrames(timing.delay, fps) : 0;
  const totalDuration = Math.max(1, resolveBeatFrames(timing.duration ?? "normal", fps));
  // Every row gets its own slice of the total window, animating over roughly
  // half of it — so a row that starts late still has time to finish inside
  // `totalDuration`, and every row is done by the time the step's own
  // duration (the caller's `timing.duration`) elapses.
  const rowDuration = Math.max(1, Math.round(totalDuration * 0.6));
  const eachFrames = rows.length > 1 ? Math.max(1, Math.round((totalDuration - rowDuration) / (rows.length - 1))) : 0;

  return (
    <div className={cn("w-full overflow-clip rounded-ui border border-border bg-code-bg text-code-fg flex flex-col", className)}>
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
        <div ref={rulerRef} aria-hidden className="invisible absolute px-2 font-mono text-xs leading-relaxed whitespace-pre">
          0
        </div>
        {rows.map((row, i) => (
          <CodeDiffRow
            key={i}
            row={row}
            language={language}
            delayFrames={baseDelay + i * eachFrames}
            durationFrames={rowDuration}
            lineHeight={lineHeight}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
