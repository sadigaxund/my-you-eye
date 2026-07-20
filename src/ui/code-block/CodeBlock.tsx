import { forwardRef, useState, useCallback, useMemo } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { tokenize, splitTokensByLine, renderHighlightedLine } from "./CodeBlock.highlight";

const codeBlockVariants = cva(
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

export interface HighlightRangeDef {
  line: number;
  start: number;
  end: number;
  color?: "primary" | "warning" | "success" | "danger";
}

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
  /** Substring-level highlight ranges (0-indexed char positions within each line). */
  highlightRanges?: HighlightRangeDef[];
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

const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ className, variant, code, language, header, wrap = true, showLineNumbers = false, highlight = false, highlightLines, highlightColor = "primary", highlightGroups, highlightRanges, ...props }, ref) => {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(() => {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }, [code]);

    const lines = useMemo(() => code.split("\n"), [code]);
    const hasHeader = Boolean(header || language);
    const showGutter = showLineNumbers
      || (highlightLines != null && highlightLines.length > 0)
      || (highlightGroups != null && highlightGroups.length > 0)
      || (highlightRanges != null && highlightRanges.length > 0);

    const highlighted = useMemo(() => {
      if (!highlight) return null;
      return tokenize(code, language);
    }, [code, language, highlight]);

    const HIGHLIGHT_BG: Record<string, string> = {
      primary: "bg-primary/10",
      warning: "bg-warning/15",
      success: "bg-success/10",
      danger: "bg-danger/10",
    };

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

    const SUBSTR_BG: Record<string, string> = {
      primary: "bg-primary/15",
      warning: "bg-warning/20",
      success: "bg-success/15",
      danger: "bg-danger/15",
    };

    const lineRanges = useMemo(() => {
      const map = new Map<number, { start: number; end: number; color: string }[]>();
      if (!highlightRanges) return map;
      for (const r of highlightRanges) {
        const line = r.line;
        if (!map.has(line)) map.set(line, []);
        map.get(line)!.push({ start: r.start, end: r.end, color: r.color ?? "primary" });
      }
      return map;
    }, [highlightRanges]);

    const highlightBlocks = useMemo(() => {
      if (!highlightRanges || highlightRanges.length === 0) return [];
      const sorted = [...highlightRanges].sort((a, b) => a.line - b.line || a.start - b.start);
      const blocks: { startLine: number; endLine: number; minCol: number; maxCol: number; color: string }[] = [];
      for (const r of sorted) {
        const last = blocks[blocks.length - 1];
        if (last && r.line <= last.endLine + 1 && r.start < last.maxCol && r.end > last.minCol) {
          last.endLine = Math.max(last.endLine, r.line);
          last.minCol = Math.min(last.minCol, r.start);
          last.maxCol = Math.max(last.maxCol, r.end);
        } else {
          blocks.push({ startLine: r.line, endLine: r.line, minCol: r.start, maxCol: r.end, color: r.color ?? "primary" });
        }
      }
      return blocks;
    }, [highlightRanges]);

    const BLOCK_BORDER: Record<string, string> = {
      primary: "border-primary/25",
      warning: "border-warning/30",
      success: "border-success/25",
      danger: "border-danger/30",
    };

    function segmentedLine(line: string, ranges: { start: number; end: number; color: string }[], isBlock: "first" | "mid" | "last" | "single" | null) {
      const sorted = [...ranges].sort((a, b) => a.start - b.start);
      const parts: ReactNode[] = [];
      let pos = 0;
      for (let i = 0; i < sorted.length; i++) {
        const r = sorted[i];
        const s = Math.max(r.start, 0);
        const e = Math.min(r.end, line.length);
        if (s > pos) parts.push(<span key={`t${i}`}>{line.slice(pos, s)}</span>);
        if (e > s) {
          const bg = SUBSTR_BG[r.color] ?? SUBSTR_BG.primary;
          let radius = "rounded-sm";
          if (isBlock === "first") radius = "rounded-t-sm";
          else if (isBlock === "mid") radius = "rounded-none";
          else if (isBlock === "last") radius = "rounded-b-sm";
          parts.push(
            <span key={`h${i}`} className={cn(bg, radius, "px-0.5 -mx-0.5 py-px -my-px")}>
              {line.slice(s, e)}
            </span>,
          );
          pos = e;
        }
        while (i + 1 < sorted.length && sorted[i + 1].start < pos) i++;
      }
      if (pos < line.length) parts.push(<span key="end">{line.slice(pos)}</span>);
      if (parts.length === 0) parts.push(<span key="e">&nbsp;</span>);
      return <>{parts}</>;
    }

    function blockPosition(line: number): "first" | "mid" | "last" | "single" | null {
      const b = highlightBlocks.find(bb => line >= bb.startLine && line <= bb.endLine);
      if (!b) return null;
      if (b.startLine === b.endLine) return "single";
      if (line === b.startLine) return "first";
      if (line === b.endLine) return "last";
      return "mid";
    }

    return (
      <div className={cn(codeBlockVariants({ variant }), className)}>
        {hasHeader && (
          <div className="flex items-center justify-between gap-2 h-9 pl-panel pr-1.5 border-b border-border">
            <div className="flex items-center gap-2 min-w-0">
              {header && <span className="text-xs font-medium text-code-fg truncate">{header}</span>}
              {language && (
                <span className="shrink-0 rounded-ui-sm bg-code-bg/80 px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide text-code-muted border border-border/50">
                  {language}
                </span>
              )}
            </div>
            <CopyButton copied={copied} onCopy={copy} />
          </div>
        )}
        <div className="flex flex-col flex-1 min-h-0">
          {!hasHeader && (
            <div className="sticky top-0 z-10 flex justify-end pr-1 -mb-7">
              <div className="flex items-center gap-1 pt-1">
                {language && (
                  <span className="rounded-ui-sm bg-code-bg/80 px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide text-code-muted border border-border/50 pointer-events-none">
                    {language}
                  </span>
                )}
                <CopyButton copied={copied} onCopy={copy} />
              </div>
            </div>
          )}
          <div className="flex flex-1 min-h-0 overflow-x-auto">
          {showGutter && (
            <div
              aria-hidden
              className="select-none shrink-0 py-panel text-right font-mono text-xs leading-relaxed text-code-muted border-r border-border"
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
                "flex-1 min-w-0 py-panel font-mono text-xs leading-relaxed text-code-fg",
                wrap && "whitespace-pre-wrap break-words",
              )}
              {...props}
            >
              <code>
                {(() => {
                  const els: ReactNode[] = [];
                  let i = 0;
                  while (i < lines.length) {
                    const ln = i + 1;
                    const block = highlightBlocks.find(b => ln >= b.startLine && ln <= b.endLine);
                    if (block && ln === block.startLine) {
                      for (let j = block.startLine; j <= block.endLine; j++) {
                        const bln = j;
                        const r = lineRanges.get(bln);
                        const lineText = lines[bln - 1];
                        const bp = blockPosition(bln);
                        const borderCls = cn(
                          BLOCK_BORDER[block.color],
                          bp === "first" || bp === "single" ? "border-t" : "",
                          bp === "first" ? "rounded-t-sm" : bp === "last" ? "rounded-b-sm" : bp === "mid" ? "" : "rounded-sm",
                          bp !== "mid" ? "border-l border-r" : "border-l border-r",
                        );
                        els.push(
                          <div key={`bl${bln}`} className={cn(SUBSTR_BG[block.color], borderCls, "px-panel", lineColor.get(bln))}>
                            {r ? segmentedLine(lineText, r, bp) : perLineTokens[bln - 1] && perLineTokens[bln - 1].length > 0 ? renderHighlightedLine(perLineTokens[bln - 1]) : lineText || " "}
                          </div>,
                        );
                      }
                      i = block.endLine;
                    } else if (!block) {
                      const r = lineRanges.get(ln);
                      els.push(
                        <div key={`ln${i}`} className={cn("px-panel", lineColor.get(i + 1))}>
                          {r ? segmentedLine(lines[i], r, null) : perLineTokens[i] && perLineTokens[i].length > 0 ? renderHighlightedLine(perLineTokens[i]) : lines[i] || " "}
                        </div>,
                      );
                      i++;
                    } else {
                      i++;
                    }
                  }
                  return els;
                })()}
              </code>
            </pre>
          ) : (
            <pre
              ref={ref}
              className={cn(
                "flex-1 min-w-0 py-panel font-mono text-xs leading-relaxed text-code-fg",
                wrap && "whitespace-pre-wrap break-words",
              )}
              {...props}
            >
              <code>
                {(() => {
                  const els: ReactNode[] = [];
                  let i = 0;
                  while (i < lines.length) {
                    const ln = i + 1;
                    const block = highlightBlocks.find(b => ln >= b.startLine && ln <= b.endLine);
                    if (block && ln === block.startLine) {
                      for (let j = block.startLine; j <= block.endLine; j++) {
                        const bln = j;
                        const r = lineRanges.get(bln);
                        const lineText = lines[bln - 1];
                        const bp = blockPosition(bln);
                        const borderCls = cn(
                          BLOCK_BORDER[block.color],
                          bp === "first" || bp === "single" ? "border-t" : "",
                          bp === "first" ? "rounded-t-sm" : bp === "last" ? "rounded-b-sm" : bp === "mid" ? "" : "rounded-sm",
                          bp !== "mid" ? "border-l border-r" : "border-l border-r",
                        );
                        els.push(
                          <div key={`bl${bln}`} className={cn(SUBSTR_BG[block.color], borderCls, "px-panel", lineColor.get(bln))}>
                            {r ? segmentedLine(lineText, r, bp) : lineText || " "}
                          </div>,
                        );
                      }
                      i = block.endLine;
                    } else if (!block) {
                      const r = lineRanges.get(ln);
                      els.push(
                        <div key={`ln${i}`} className={cn("px-panel", lineColor.get(i + 1))}>
                          {r ? segmentedLine(lines[i], r, null) : lines[i] || " "}
                        </div>,
                      );
                      i++;
                    } else {
                      i++;
                    }
                  }
                  return els;
                })()}
              </code>
            </pre>
          )}
        </div>
      </div>
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
