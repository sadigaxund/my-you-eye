function numberParts(value: number, opts?: Intl.NumberFormatOptions) {
  const n = Number(value);
  if (isNaN(n)) return null;
  return { n, parts: new Intl.NumberFormat(undefined, opts).formatToParts(n) };
}

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

export function NumberDisplay({ value, compact }: { value: unknown; compact?: boolean }) {
  const r = numberParts(Number(value), compact ? { notation: "compact", maximumFractionDigits: 1 } : undefined);
  if (!r) return <span className="text-muted">—</span>;
  return (
    <span className={common}>
      {styledParts(r.parts, { integer: "font-medium", fraction: "text-muted text-xs", decimal: "text-muted", group: "text-muted" })}
    </span>
  );
}

export function PercentageDisplay({ value }: { value: unknown }) {
  const n = Number(value);
  if (isNaN(n)) return <span className="text-muted">—</span>;
  const parts = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }).formatToParts(n);
  return (
    <span className={common}>
      {styledParts(parts, { integer: "font-medium", fraction: "text-muted text-xs", decimal: "text-muted", percentSign: "text-muted text-xs" })}
    </span>
  );
}

export function BytesDisplay({ value, compact }: { value: unknown; compact?: boolean }) {
  const n = Number(value);
  if (isNaN(n)) return <span className="text-muted">—</span>;
  const units: Intl.NumberFormatOptions["unit"][] = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
  const short = ["B", "KB", "MB", "GB", "TB"];
  let i = 0, s = n;
  while (s >= 1024 && i < units.length - 1) { s /= 1024; i++; }
  const opts: Intl.NumberFormatOptions = { style: "unit", unit: units[i], unitDisplay: "short", maximumFractionDigits: 1 };
  if (compact) opts.notation = "compact";
  const parts = new Intl.NumberFormat(undefined, opts).formatToParts(s);
  const unitLabel = parts.find(p => p.type === "unit")?.value ?? short[i];
  const nonUnit = parts.filter(p => p.type !== "unit");
  return (
    <span className={common}>
      {styledParts(nonUnit, { integer: "font-medium", fraction: "text-muted text-xs", decimal: "text-muted", group: "text-muted" })}
      <span className="text-muted text-xs"> {unitLabel}</span>
    </span>
  );
}

export function DurationDisplay({ value }: { value: unknown }) {
  const sec = Number(value);
  if (isNaN(sec)) return <span className="text-muted">—</span>;
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.round(sec % 60);
  const segs: { v: string; u: string }[] = [];
  if (h > 0) segs.push({ v: String(h), u: "h" });
  if (m > 0) segs.push({ v: String(m), u: "m" });
  if (s > 0 || segs.length === 0) segs.push({ v: String(s), u: "s" });
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

export function CurrencyDisplay({ value, compact }: { value: unknown; compact?: boolean }) {
  const r = numberParts(Number(value), { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2, ...(compact ? { notation: "compact" } : {}) });
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
  const n = Number(value);
  if (isNaN(n)) return <span className="text-muted">—</span>;
  const positive = n > 0;
  const negative = n < 0;
  const color = positive ? "text-success" : negative ? "text-danger" : "text-muted";
  const abs = Math.abs(n);
  const parts = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).formatToParts(abs);
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
          {styledParts(parts, { integer: "font-semibold", fraction: "text-muted text-xs", decimal: "text-muted", group: "text-muted" })}
        </span>
      </span>
    </span>
  );
}
