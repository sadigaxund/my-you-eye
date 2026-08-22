import { useState } from "react";
import { cn } from "../../lib/cn";
import { Badge } from "../badge";
import { Avatar } from "../avatar";
import { Sparkline } from "../sparkline";
import { CodeBlock } from "../code-block";
import { Progress } from "../progress";
import { Button } from "../button";
import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { ScrollArea } from "../scroll-area";
import { PercentageDisplay } from "./CellType.numeric-displays";
import { useTruncated, ExpandIndicator, EXPAND_POPOVER_STYLE } from "./CellType.shared";

// ─── sparkline ───────────────────────────────────────────────────────────
// A trend inside a cell. Reuses Sparkline as-is (no forked chart math) —
// see AGENTS.md TODO A9 for why this earns its own CellType slot now that
// Sparkline exists: a table column of numbers often IS a trend, and asking
// a consuming app to hand-roll the SVG per row is exactly what CellType
// exists to avoid.
export function SparklineDisplay({ value }: { value: unknown }) {
  const data = Array.isArray(value) ? value.filter((v): v is number => typeof v === "number") : [];
  if (data.length < 2) return <span className="text-muted">—</span>;
  return <Sparkline data={data} width={64} height={20} area />;
}

// ─── tags ────────────────────────────────────────────────────────────────
// Multiple small pills for a genuinely multi-valued categorical field (as
// opposed to "array", which is any list and shows a count + popover).
// Reuses Badge directly, no popover — tags are meant to be scannable
// in-cell, not stashed behind a click.
export function TagsDisplay({ value }: { value: unknown }) {
  const tags = Array.isArray(value) ? value.map(String) : [];
  if (tags.length === 0) return <span className="text-muted">—</span>;
  return (
    <span className="flex flex-wrap items-center gap-1 min-w-0">
      {tags.map((t, i) => (
        <Badge key={i} variant="neutral" tone="soft" className="text-xs px-1.5 py-0 leading-none">{t}</Badge>
      ))}
    </span>
  );
}

// ─── code ────────────────────────────────────────────────────────────────
// An inline snippet reusing CodeBlock — same popover-on-click shape as
// JsonDisplay, so a "code" column (a query, a small config fragment) gets
// the exact same syntax highlighting CellType's "json" type does.
export function CodeDisplay({ value, language }: { value: unknown; language?: string }) {
  const code = String(value);
  const lines = code.split("\n");
  const firstLine = lines[0];
  const [previewRef, isTruncated] = useTruncated<HTMLSpanElement>([value]);
  // Multi-line code always has "more" below the first-line preview, even
  // when that first line itself isn't clipped — so the indicator isn't
  // gated on isTruncated alone the way plain single-line text is.
  const hasMore = isTruncated || lines.length > 1;
  return (
    <Popover>
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors flex w-full max-w-full min-w-0 items-center gap-1.5">
        <span ref={previewRef} className="block min-w-0 flex-1 overflow-hidden whitespace-nowrap text-left">{firstLine}</span>
        {hasMore && <ExpandIndicator />}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="p-2 overflow-hidden" style={EXPAND_POPOVER_STYLE}>
        <ScrollArea className="max-h-72">
          <CodeBlock code={code} language={language ?? "text"} highlight={Boolean(language)} wrap={false} bare />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// ─── color ───────────────────────────────────────────────────────────────
// Swatch + the raw value. The swatch's background is the one genuinely
// dynamic per-row value AGENTS.md §6 carves an inline `style` exception
// for — it's arbitrary user data (a hex/oklch/named CSS color), not a
// design constant, so it can't come from a Tailwind token.
export function ColorDisplay({ value }: { value: unknown }) {
  const color = String(value);
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0 w-full font-mono text-xs">
      <span className="size-icon shrink-0 rounded-ui-sm border border-border" style={{ backgroundColor: color }} aria-hidden />
      <span className="truncate">{color}</span>
    </span>
  );
}

// ─── hash / uuid ─────────────────────────────────────────────────────────
// Middle-truncated, not end-truncated: for a hash or UUID, the identifying
// information is spread across the whole string, so cutting off the tail
// (what every other truncation in this file does) hides half of what
// makes it recognizable. Head + tail, always monospace.
export function HashDisplay({ value }: { value: unknown }) {
  const s = String(value);
  const shown = s.length > 16 ? `${s.slice(0, 8)}…${s.slice(-6)}` : s;
  return (
    <span title={s} className="font-mono text-xs tabular-nums cursor-help truncate inline-block max-w-full align-middle">
      {shown}
    </span>
  );
}

// ─── user ────────────────────────────────────────────────────────────────
// Reuses Avatar (fallback initials from the name) + the name itself —
// the common "assigned to" / "owner" column shape.
export function UserDisplay({ value, avatarSrc }: { value: unknown; avatarSrc?: string }) {
  const name = String(value);
  return (
    <span className="inline-flex items-center gap-2 min-w-0 w-full">
      <Avatar size="sm" src={avatarSrc} alt="" fallback={name || "?"} className="shrink-0" />
      <span className="truncate text-sm">{name}</span>
    </span>
  );
}

// ─── progress ────────────────────────────────────────────────────────────
// An inline bar reusing Progress, plus the percentage reusing
// PercentageDisplay (CellType's own "percentage" type) rather than a
// second ad-hoc number format — the bar is the only new rendering here.
export function ProgressCellDisplay({ value }: { value: unknown }) {
  const n = Number(value);
  if (isNaN(n)) return <span className="text-muted">—</span>;
  const clamped = Math.min(100, Math.max(0, n));
  return (
    <span className="inline-flex items-center gap-2 min-w-0 w-full">
      <Progress value={clamped} className="flex-1 min-w-0" />
      <PercentageDisplay value={clamped / 100} fractionDigits={0} />
    </span>
  );
}

// ─── secret ──────────────────────────────────────────────────────────────
// Masked by default, click to reveal — for API keys/tokens in a table
// that shouldn't be plaintext-visible by default (shoulder-surfing during
// a screen share is the actual threat model). Reuses Button for the
// reveal toggle, same icon-button shape as CellType's AudioDisplay.
export function SecretDisplay({ value }: { value: unknown }) {
  const s = String(value);
  const [revealed, setRevealed] = useState(false);
  return (
    <span className="inline-flex items-center gap-1.5 min-w-0 w-full font-mono text-xs" onClick={(e) => e.stopPropagation()}>
      <span className={cn("truncate flex-1 min-w-0", !revealed && "tracking-widest")}>
        {revealed ? s : "•".repeat(Math.min(s.length, 16) || 8)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="shrink-0"
        onClick={() => setRevealed((r) => !r)}
        aria-label={revealed ? "Hide" : "Reveal"}
      >
        {revealed ? (
          <svg viewBox="0 0 12 12" className="size-icon-sm fill-none stroke-current" strokeWidth="1.3"><path d="M1 6s2-3.5 5-3.5S11 6 11 6s-2 3.5-5 3.5S1 6 1 6z" /><circle cx="6" cy="6" r="1.3" /></svg>
        ) : (
          <svg viewBox="0 0 12 12" className="size-icon-sm fill-none stroke-current" strokeWidth="1.3"><path d="M1.5 1.5l9 9M1 6s2-3.5 5-3.5c.9 0 1.7.2 2.4.6M11 6s-.6 1.1-1.8 2M4.2 4.2A2 2 0 006 8c.5 0 1-.2 1.3-.5" /></svg>
        )}
      </Button>
    </span>
  );
}
