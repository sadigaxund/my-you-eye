import { forwardRef, useState, useCallback, useMemo } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { ScrollArea } from "../scroll-area";
import { tokenize, splitTokensByLine, renderHighlightedLine } from "./CodeBlock.highlight";
import { useHighlightOverlay } from "./CodeBlock.useHighlightOverlay";
import { CodeHeaderBar, LanguageBadge } from "./CodeBlock.chrome";

/** Exported so the scenes-tier `CodeDiff` frames itself identically instead
 * of copying the class string — see CodeBlock.chrome.tsx. */
export const codeBlockVariants = cva(
  "group relative overflow-clip rounded-ui border border-border bg-code-bg text-sm flex flex-col",
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

export interface CodeBlockHighlightGroup {
  lines: number[];
  color?: "primary" | "warning" | "success" | "danger";
}

/**
 * One substring highlight. Give it either a `match` (preferred) or an
 * explicit `start`/`end` char offset pair.
 *
 * `match` exists because offsets are unverifiable by eye. Nobody reading
 * `{ line: 2, start: 6, end: 18 }` can tell what it highlights without
 * counting characters, so in practice they end up landing mid-token — which
 * is exactly what the owner saw across the showcase ("highlighting random
 * incomprehensible parts of the code"). `{ line: 2, match: "order.valid" }`
 * says what it means and cannot be subtly wrong: if the text isn't on that
 * line, nothing is highlighted rather than the wrong thing being
 * highlighted.
 */
export type HighlightRangeDef = {
  /** 1-based line number. */
  line: number;
  color?: "primary" | "warning" | "success" | "danger";
} & (
  | {
      /** Text to highlight. A string matches literally; a RegExp is applied
       * to the line (the `g` flag is unnecessary — `occurrence` selects). */
      match: string | RegExp;
      /** Which occurrence to take when the line contains several, 1-based.
       * Default 1. */
      occurrence?: number;
      start?: never;
      end?: never;
    }
  | {
      /** 0-based char offset, inclusive. Escape hatch for a span that no
       * substring names — e.g. a run of whitespace, or a slice of a
       * repeated token. Prefer `match`. */
      start: number;
      /** 0-based char offset, exclusive. */
      end: number;
      match?: never;
      occurrence?: never;
    }
);

export interface CodeBlockProps
  extends HTMLAttributes<HTMLPreElement>,
    VariantProps<typeof codeBlockVariants> {
  code: string;
  language?: string;
  header?: string;
  wrap?: boolean;
  showLineNumbers?: boolean;
  /** Enable syntax highlighting for supported languages (js, ts, tsx, json, bash). */
  highlight?: boolean;
  /** 1-indexed line numbers to highlight. Implicitly enables line numbers. */
  highlightLines?: number[];
  /** Color for highlightLines (default "primary"). */
  highlightColor?: CodeBlockHighlightGroup["color"];
  /** Multi-color highlight groups. When provided, takes precedence over highlightLines. */
  highlightGroups?: CodeBlockHighlightGroup[];
  /**
   * Substring-level highlight ranges (0-indexed char positions within each line).
   * Rects are positioned from real rendered line/glyph geometry (measured via a
   * hidden ruler + ResizeObserver), so they stay correct across theme/font changes
   * and container resizes — see AGENTS.md TODO A1.
   *
   * Forces `wrap={false}` internally: the overlay assumes exactly one visual row
   * per logical line, and a wrapped row would push every highlight below it out
   * of alignment. If you need highlights on long lines, keep them unwrapped and
   * let the block scroll horizontally instead.
   */
  highlightRanges?: HighlightRangeDef[];
  /**
   * 1-based line numbers outside this `[start, end]` range get a reduced
   * opacity (the `opacity-muted` token) instead of full contrast — the
   * "focus on this range, dim the rest" treatment a code walkthrough needs.
   * Added for `my-you-eye/scenes`' `CodeScene` (TODO.md Phase E): additive,
   * defaults to no dimming.
   */
  focusRange?: [number, number];
  /**
   * Assigns an `id` to each rendered line's row element, keyed by its
   * 1-based line number. Added for `CodeScene`, which needs to measure a
   * specific line's on-screen position (via `offsetTop`/`offsetLeft`, never
   * `getBoundingClientRect()` — AGENTS.md §7) to drive `Camera`/`Annotation`
   * at that line. Optional, additive: omit it and lines render without ids,
   * exactly as before.
   */
  lineId?: (lineNumber: number) => string;
  /**
   * Strips the persistent header bar (filename/language badge) and the
   * block's own opaque background/border, leaving only a hover-revealed
   * copy button in the corner. For embedding CodeBlock inside a surface
   * that already provides its own chrome — e.g. a Popover — where a
   * second header and a second opaque panel read as a redundant nested
   * box (CellType's JSON/code cell previews). `language` is still used
   * for syntax highlighting when `highlight` is set; it's just never
   * displayed. Additive: omit for CodeBlock's normal framed appearance.
   */
  bare?: boolean;
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5 fill-code-muted">
      <path d="M3 1h6l2 2v6a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1zm0 1v7h7V3.5L8.5 2H3z" />
      <path d="M2 4H1v6a1 1 0 001 1h6v-1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5 fill-success">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function CopyButton({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "flex items-center gap-1 rounded-ui-sm px-1.5 h-6 shrink-0",
        "text-xs text-code-muted hover:text-code-fg hover:bg-code-bg/80 border border-transparent hover:border-border",
        "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-[var(--duration-fast)]",
        "outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring cursor-pointer",
        copied && "opacity-100",
      )}
      title="Copy code"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span className={cn(copied && "text-success")}>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

const HIGHLIGHT_BG: Record<string, string> = {
  primary: "bg-primary/10",
  warning: "bg-warning/15",
  success: "bg-success/10",
  danger: "bg-danger/10",
};

const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ className, variant, code, language, header, wrap = true, showLineNumbers = false, highlight = false, highlightLines, highlightColor = "primary", highlightGroups, highlightRanges, focusRange, lineId, bare = false, ...props }, ref) => {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(() => {
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }, [code]);

    const lines = useMemo(() => code.split("\n"), [code]);
    // `bare` always suppresses the header bar, even if header/language were
    // passed — `language` is still forwarded to the tokenizer below for
    // highlighting, it's just never displayed as a badge.
    const hasHeader = !bare && Boolean(header || language);

    const highlighted = useMemo(() => {
      if (!highlight) return null;
      return tokenize(code, language);
    }, [code, language, highlight]);

    const lineColor = useMemo(() => {
      const map = new Map<number, string>();
      if (highlightGroups) {
        for (const g of highlightGroups) {
          const cls = HIGHLIGHT_BG[g.color ?? "primary"] ?? HIGHLIGHT_BG.primary;
          for (const ln of g.lines) map.set(ln, cls);
        }
      } else if (highlightLines) {
        const cls = HIGHLIGHT_BG[highlightColor ?? "primary"] ?? HIGHLIGHT_BG.primary;
        for (const ln of highlightLines) map.set(ln, cls);
      }
      return map;
    }, [highlightLines, highlightColor, highlightGroups]);

    const perLineTokens = useMemo(() => {
      if (!highlighted) return null;
      return splitTokensByLine(highlighted);
    }, [highlighted]);

    // See CodeBlock.useHighlightOverlay.tsx for why this is measured from
    // real rendered geometry rather than the old CHAR_W/LINE_H/PAD constants.
    const { rulerRef, setLineRef, hasRanges, overlays, RULER_LEN } = useHighlightOverlay(highlightRanges, code, perLineTokens);
    // The overlay assumes one visual row per logical line. Wrapping would
    // desync every rect below the first wrapped line, so a correct-but-
    // scrolling block beats a silently-misaligned wrapped one — see the
    // highlightRanges JSDoc above.
    const effectiveWrap = wrap && !hasRanges;
    const isDimmed = useCallback(
      (lineNumber: number) => focusRange != null && (lineNumber < focusRange[0] || lineNumber > focusRange[1]),
      [focusRange],
    );
    const showGutter = showLineNumbers
      || (highlightLines != null && highlightLines.length > 0)
      || (highlightGroups != null && highlightGroups.length > 0)
      || hasRanges;

    return (
      <div
        className={cn(
          codeBlockVariants({ variant }),
          // Overrides the base bg-code-bg/border-border pair (tailwind-merge
          // resolves the conflict, last write wins) so the block blends into
          // whatever surface it's embedded in instead of drawing a second,
          // redundant panel — see the `bare` JSDoc above.
          bare && "bg-transparent border-transparent",
          className,
        )}
      >
        {hasRanges && (
          <span
            ref={rulerRef}
            aria-hidden
            className="invisible absolute size-0 overflow-hidden whitespace-pre font-mono text-xs leading-relaxed"
          >
            {"0".repeat(RULER_LEN)}
          </span>
        )}
        {hasHeader && (
          <CodeHeaderBar header={header} language={language} trailing={<CopyButton copied={copied} onCopy={copy} />} />
        )}
        {!hasHeader && (
          <div className="absolute top-1 right-1 z-10 flex items-center gap-1">
            {/* `bare` drops the floating language badge too — the point is
                no persistent chrome at all, just the hover-revealed copy
                button (CopyButton is opacity-0 until group-hover on its own). */}
            {!bare && language && <LanguageBadge language={language} floating />}
            <CopyButton copied={copied} onCopy={copy} />
          </div>
        )}
        <div className="flex flex-col flex-1 min-h-0">
          <ScrollArea orientation="horizontal" className="flex flex-1 min-h-0 rounded-b-[inherit]">
            {showGutter && (
              <div
                aria-hidden
                className="sticky left-0 z-10 select-none shrink-0 bg-code-bg py-panel text-right font-mono text-xs leading-relaxed text-code-muted border-r border-border"
              >
                {lines.map((_, i) => (
                  <div key={i} className={cn("pl-compact-x pr-compact-x", lineColor.get(i + 1))}>{i + 1}</div>
                ))}
              </div>
            )}
            {perLineTokens ? (
              <pre
                ref={ref}
                className={cn(
                  "flex-1 min-w-0 py-panel font-mono text-xs leading-relaxed text-code-fg relative",
                  effectiveWrap && "whitespace-pre-wrap break-words",
                )}
                {...props}
              >
                <code>
                  {perLineTokens.map((lineTokens, i) => (
                    <div
                      key={i}
                      id={lineId?.(i + 1)}
                      ref={setLineRef(i)}
                      className={cn("px-panel", lineColor.get(i + 1), isDimmed(i + 1) && "opacity-muted")}
                    >
                      {lineTokens.length > 0 ? renderHighlightedLine(lineTokens) : " "}
                    </div>
                  ))}
                </code>
                {overlays}
              </pre>
            ) : (
              <pre
                ref={ref}
                className={cn(
                  "flex-1 min-w-0 py-panel font-mono text-xs leading-relaxed text-code-fg relative",
                  effectiveWrap && "whitespace-pre-wrap break-words",
                )}
                {...props}
              >
                <code>
                  {lines.map((line, i) => (
                    <div
                      key={i}
                      id={lineId?.(i + 1)}
                      ref={setLineRef(i)}
                      className={cn("px-panel", lineColor.get(i + 1), isDimmed(i + 1) && "opacity-muted")}
                    >
                      {line || " "}
                    </div>
                  ))}
                </code>
                {overlays}
              </pre>
            )}
          </ScrollArea>
        </div>
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
