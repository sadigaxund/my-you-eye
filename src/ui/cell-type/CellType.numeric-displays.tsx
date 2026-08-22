import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import {
  formatNumberParts, formatPercentageParts, formatBytesParts, formatDurationParts,
  formatCurrencyParts, formatSignedParts,
} from "../../lib/format";

function styledParts(parts: Intl.NumberFormatPart[], overrides?: {
  integer?: string; fraction?: string; decimal?: string; group?: string;
  literal?: string; unit?: string; currency?: string; percentSign?: string;
}) {
  return parts.map((p, i) => {
    const cls = overrides?.[p.type as keyof typeof overrides];
    return cls ? <span key={i} className={cls}>{p.value}</span> : p.value;
  });
}

const common = "font-mono tabular-nums truncate inline-block max-w-full align-middle";

/**
 * Shared "number + constant-width unit" layout for every numeric type that
 * has a static suffix/prefix (% in Percentage, MB in Bytes, currency code
 * in Currency, …). A 2-column CSS grid, not a JS measurement: column 1
 * (the number) is `1fr` and right-aligned, column 2 (the unit) is `auto`
 * and left-aligned. Because the unit's own text is identical for every row
 * in the same column (all "%", all "MB", …) its `auto` track resolves to
 * the same width on every row, which pins the number/unit boundary to a
 * fixed x-position down the column — combined with `tabular-nums` on the
 * digits (equal advance width per glyph), this is what actually produces
 * column alignment. Pure CSS: no `getBoundingClientRect`, no padding
 * strings, no per-row width measurement (AGENTS.md §7 / owner's explicit
 * "DO NOT measure text and pad" instruction).
 */
function NumberUnitRow({ number, unit, unitPosition = "suffix", className }: { number: ReactNode; unit?: ReactNode; unitPosition?: "prefix" | "suffix"; className?: string }) {
  const numberCol = <span className="text-right">{number}</span>;
  // A suffix unit reads as a separate token ("2.0 kB", "12.3 %") and takes a
  // thin space; a prefix unit is part of the numeral ("$1,234.56") and must
  // not. Grid `gap` can't express that — it would space both — so the space
  // belongs to the unit cell.
  const unitCol = unit ? <span className={unitPosition === "suffix" ? "pl-1" : undefined}>{unit}</span> : null;
  return (
    <span className={cn(common, "inline-grid grid-cols-[1fr_auto_auto] items-baseline align-middle", className)}>
      {/* The empty leading `1fr` is the whole layout. Every other track is
          `auto`, so the number and its unit form one right-aligned group that
          stays glued together however wide the cell is. The first version put
          the `1fr` on the NUMBER instead, which works for a suffix but tears a
          prefix apart: `$` sat pinned to the cell's left edge with the digits
          flung to the right (owner: "Currency type has dollar sign on the
          left, and the value on the right, is it purposely done?"). It also
          left every no-unit type (`number`, `duration`, `signed`) rendering as
          a plain left-aligned inline-block, so one column mixed both
          alignments. The spacer gives all of them the same behaviour. */}
      <span aria-hidden />
      {unitPosition === "prefix" ? <>{unitCol}{numberCol}</> : <>{numberCol}{unitCol}</>}
    </span>
  );
}

export function NumberDisplay({ value, compact, fractionDigits }: { value: unknown; compact?: boolean; fractionDigits?: number }) {
  const r = formatNumberParts(value, { fractionDigits, compact });
  if (!r) return <span className="text-muted">—</span>;
  return (
    <NumberUnitRow
      number={styledParts(r.parts, { integer: "font-medium", fraction: "text-muted text-xs", decimal: "text-muted", group: "text-muted" })}
    />
  );
}

export function PercentageDisplay({ value, fractionDigits }: { value: unknown; fractionDigits?: number }) {
  const r = formatPercentageParts(value, fractionDigits ?? 1);
  if (!r) return <span className="text-muted">—</span>;
  // "%" is its own grid column (see NumberUnitRow) rather than trailing
  // inline text — that's the structural separation the owner asked for,
  // and it's what makes the "%" sign land at the same x-position on every
  // row of the column instead of drifting with the number's digit count.
  const numberParts = r.parts.filter((p) => p.type !== "percentSign");
  const unitParts = r.parts.filter((p) => p.type === "percentSign");
  return (
    <NumberUnitRow
      number={styledParts(numberParts, { integer: "font-medium", fraction: "text-muted text-xs", decimal: "text-muted" })}
      unit={styledParts(unitParts, { percentSign: "text-muted text-xs" })}
    />
  );
}

export function BytesDisplay({ value, compact, displayUnit }: { value: unknown; compact?: boolean; displayUnit?: string }) {
  const r = formatBytesParts(value, { compact, displayUnit });
  if (!r) return <span className="text-muted">—</span>;
  return (
    <NumberUnitRow
      number={styledParts(r.parts, { integer: "font-medium", fraction: "text-muted text-xs", decimal: "text-muted", group: "text-muted" })}
      unit={<span className="text-muted text-xs">{r.unitLabel}</span>}
    />
  );
}

export function DurationDisplay({ value }: { value: unknown }) {
  const segs = formatDurationParts(value);
  if (!segs) return <span className="text-muted">—</span>;
  return (
    <NumberUnitRow number={
      segs.map((seg, i) => (
        <span key={i}>
          {i > 0 && <span className="text-muted text-xs"> </span>}
          <span className={i === 0 ? "font-medium" : "text-muted text-xs"}>
            {/* Zero-pad every non-leading segment (mirrors the AudioDisplay
                seek-time convention elsewhere in this file's sibling module)
                so "3h 5m" becomes "3h 05m" — a fixed 2-digit width for every
                segment after the first, which is what lets tabular-nums
                actually keep them lined up column-to-column. The leading
                segment is left unpadded on purpose: it carries the value's
                real magnitude (3h vs 12h vs 45m) and padding it would be
                misleading, not aligning. */}
            {i === 0 ? seg.v : seg.v.padStart(2, "0")}{seg.u}
          </span>
        </span>
      ))
    } />
  );
}

export function CurrencyDisplay({ value, compact, fractionDigits, currency }: { value: unknown; compact?: boolean; fractionDigits?: number; currency?: string }) {
  const r = formatCurrencyParts(value, { fractionDigits, currency, compact });
  if (!r) return <span className="text-muted">—</span>;
  const currencyIdx = r.parts.findIndex((p) => p.type === "currency");
  const isPrefix = currencyIdx <= 0;
  const numberParts = r.parts.filter((p) => p.type !== "currency");
  const unitParts = r.parts.filter((p) => p.type === "currency");
  const numberNode = numberParts.map((p, i) => {
    if (p.type === "fraction") return <span key={i} className="text-muted text-xs">{p.value}</span>;
    if (p.type === "decimal") return <span key={i} className="text-muted">{p.value}</span>;
    if (p.type === "group") return <span key={i} className="text-muted">{p.value}</span>;
    if (p.type === "literal" && compact) return <span key={i} className="text-muted text-xs">{p.value}</span>;
    return <span key={i} className="font-medium">{p.value}</span>;
  });
  const unitNode = <span className="text-muted text-xs">{unitParts.map((p) => p.value).join("")}</span>;
  return <NumberUnitRow number={numberNode} unit={unitParts.length ? unitNode : undefined} unitPosition={isPrefix ? "prefix" : "suffix"} />;
}

export function SignedDisplay({ value }: { value: unknown }) {
  const r = formatSignedParts(value);
  if (!r) return <span className="text-muted">—</span>;
  const positive = r.sign === "positive";
  const negative = r.sign === "negative";
  const color = positive ? "text-success" : negative ? "text-danger" : "text-muted";
  return (
    <NumberUnitRow className={color} number={
      <span className="inline-flex items-center gap-0.5">
        {positive && (
          <svg viewBox="0 0 12 12" className="size-icon-sm fill-current">
            <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        )}
        {negative && (
          <svg viewBox="0 0 12 12" className="size-icon-sm fill-current">
            <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        )}
        <span>
          {styledParts(r.parts, { integer: "font-semibold", fraction: "text-muted text-xs", decimal: "text-muted", group: "text-muted" })}
        </span>
      </span>
    } />
  );
}
