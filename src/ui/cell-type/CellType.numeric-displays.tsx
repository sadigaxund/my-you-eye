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

export function NumberDisplay({ value, compact, fractionDigits }: { value: unknown; compact?: boolean; fractionDigits?: number }) {
  const r = formatNumberParts(value, { fractionDigits, compact });
  if (!r) return <span className="text-muted">—</span>;
  return (
    <span className={common}>
      {styledParts(r.parts, { integer: "font-medium", fraction: "text-muted text-xs", decimal: "text-muted", group: "text-muted" })}
    </span>
  );
}

export function PercentageDisplay({ value, fractionDigits }: { value: unknown; fractionDigits?: number }) {
  const r = formatPercentageParts(value, fractionDigits ?? 1);
  if (!r) return <span className="text-muted">—</span>;
  return (
    <span className={common}>
      {styledParts(r.parts, { integer: "font-medium", fraction: "text-muted text-xs", decimal: "text-muted", percentSign: "text-muted text-xs" })}
    </span>
  );
}

export function BytesDisplay({ value, compact, displayUnit }: { value: unknown; compact?: boolean; displayUnit?: string }) {
  const r = formatBytesParts(value, { compact, displayUnit });
  if (!r) return <span className="text-muted">—</span>;
  return (
    <span className={common}>
      {styledParts(r.parts, { integer: "font-medium", fraction: "text-muted text-xs", decimal: "text-muted", group: "text-muted" })}
      <span className="text-muted text-xs"> {r.unitLabel}</span>
    </span>
  );
}

export function DurationDisplay({ value }: { value: unknown }) {
  const segs = formatDurationParts(value);
  if (!segs) return <span className="text-muted">—</span>;
  return (
    <span className={common}>
      {segs.map((seg, i) => (
        <span key={i}>
          {i > 0 && <span className="text-muted text-xs"> </span>}
          <span className={i === 0 ? "font-medium" : "text-muted text-xs"}>{seg.v}{seg.u}</span>
        </span>
      ))}
    </span>
  );
}

export function CurrencyDisplay({ value, compact, fractionDigits, currency }: { value: unknown; compact?: boolean; fractionDigits?: number; currency?: string }) {
  const r = formatCurrencyParts(value, { fractionDigits, currency, compact });
  if (!r) return <span className="text-muted">—</span>;
  return (
    <span className={common}>
      {r.parts.map((p, i) => {
        if (p.type === "currency") return <span key={i} className="text-muted text-xs">{p.value}</span>;
        if (p.type === "fraction") return <span key={i} className="text-muted text-xs">{p.value}</span>;
        if (p.type === "decimal") return <span key={i} className="text-muted">{p.value}</span>;
        if (p.type === "group") return <span key={i} className="text-muted">{p.value}</span>;
        if (p.type === "literal" && compact) return <span key={i} className="text-muted text-xs">{p.value}</span>;
        return <span key={i} className="font-medium">{p.value}</span>;
      })}
    </span>
  );
}

export function SignedDisplay({ value }: { value: unknown }) {
  const r = formatSignedParts(value);
  if (!r) return <span className="text-muted">—</span>;
  const positive = r.sign === "positive";
  const negative = r.sign === "negative";
  const color = positive ? "text-success" : negative ? "text-danger" : "text-muted";
  return (
    <span className={`${common} ${color}`}>
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
    </span>
  );
}
