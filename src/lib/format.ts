// Pure number/date formatting logic shared by CellType's numeric displays
// and (per TODO.md Phase C4) the future `CountUp` motion primitive. No JSX,
// no React — src/motion/ may depend on this file but must never depend on
// src/ui/ (AGENTS.md §9b tier separation), so the formatting logic itself
// has to live here rather than inside CellType.numeric-displays.tsx.
//
// Every function returns plain data (Intl.NumberFormatPart[] or a small
// value/unit shape) — the presentation layer (CellType) is the only place
// that turns these into styled spans.

export interface NumberFormatResult {
  n: number;
  parts: Intl.NumberFormatPart[];
}

function toNumberResult(n: number, opts?: Intl.NumberFormatOptions): NumberFormatResult | null {
  if (isNaN(n)) return null;
  return { n, parts: new Intl.NumberFormat(undefined, opts).formatToParts(n) };
}

/** Plain number, honoring optional fixed fraction digits and compact notation. */
export function formatNumberParts(value: unknown, options?: { fractionDigits?: number; compact?: boolean }): NumberFormatResult | null {
  const opts: Intl.NumberFormatOptions = options?.fractionDigits != null
    ? { minimumFractionDigits: options.fractionDigits, maximumFractionDigits: options.fractionDigits }
    : {};
  if (options?.compact) { opts.notation = "compact"; opts.maximumFractionDigits = 1; }
  return toNumberResult(Number(value), opts);
}

/** Percentage (0–1 input, formatted as %). */
export function formatPercentageParts(value: unknown, fractionDigits = 1): NumberFormatResult | null {
  const n = Number(value);
  if (isNaN(n)) return null;
  const parts = new Intl.NumberFormat(undefined, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).formatToParts(n);
  return { n, parts };
}

export const BYTE_UNITS: Intl.NumberFormatOptions["unit"][] = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];
export const BYTE_SHORT = ["B", "KB", "MB", "GB", "TB"];

export function byteUnitIndex(unit?: string): number | undefined {
  if (!unit) return undefined;
  const u = unit.toUpperCase();
  for (let i = 0; i < BYTE_SHORT.length; i++) {
    if (BYTE_SHORT[i] === u || BYTE_UNITS[i] === u.toLowerCase()) return i;
  }
  return undefined;
}

export interface BytesFormatResult {
  n: number;
  /** All formatted parts except the unit itself. */
  parts: Intl.NumberFormatPart[];
  unitLabel: string;
}

/** Bytes, auto-scaled to the largest unit that keeps the value >= 1 (or
 * forced to a specific unit via `displayUnit`, e.g. "MB"). */
export function formatBytesParts(value: unknown, options?: { compact?: boolean; displayUnit?: string }): BytesFormatResult | null {
  const n = Number(value);
  if (isNaN(n)) return null;
  const forcedIdx = byteUnitIndex(options?.displayUnit);
  let i = 0, s = n;
  if (forcedIdx != null) {
    i = forcedIdx;
    s = n / Math.pow(1024, i);
  } else {
    while (s >= 1024 && i < BYTE_UNITS.length - 1) { s /= 1024; i++; }
  }
  const opts: Intl.NumberFormatOptions = { style: "unit", unit: BYTE_UNITS[i], unitDisplay: "short", minimumFractionDigits: 1, maximumFractionDigits: 2 };
  if (options?.compact) opts.notation = "compact";
  const parts = new Intl.NumberFormat(undefined, opts).formatToParts(s);
  const unitLabel = parts.find((p) => p.type === "unit")?.value ?? BYTE_SHORT[i];
  const nonUnit = parts.filter((p) => p.type !== "unit");
  return { n: s, parts: nonUnit, unitLabel };
}

export interface DurationSegment { v: string; u: string }

/** Duration in seconds, segmented into h/m/s components (only non-zero
 * leading segments are included; always at least one segment). */
export function formatDurationParts(value: unknown): DurationSegment[] | null {
  const sec = Number(value);
  if (isNaN(sec)) return null;
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.round(sec % 60);
  const segs: DurationSegment[] = [];
  if (h > 0) segs.push({ v: String(h), u: "h" });
  if (m > 0) segs.push({ v: String(m), u: "m" });
  if (s > 0 || segs.length === 0) segs.push({ v: String(s), u: "s" });
  return segs;
}

/** Currency, via Intl's own currency formatting (parts include the "currency" part type). */
export function formatCurrencyParts(value: unknown, options?: { fractionDigits?: number; currency?: string; compact?: boolean }): NumberFormatResult | null {
  const minFrac = options?.fractionDigits ?? 2;
  const maxFrac = options?.fractionDigits ?? 2;
  return toNumberResult(Number(value), {
    style: "currency",
    currency: options?.currency ?? "USD",
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
    ...(options?.compact ? { notation: "compact" as const } : {}),
  });
}

export interface SignedFormatResult {
  n: number;
  sign: "positive" | "negative" | "zero";
  /** Parts for the absolute value. */
  parts: Intl.NumberFormatPart[];
}

/** Signed number — sign carried separately from the (always non-negative) formatted parts. */
export function formatSignedParts(value: unknown): SignedFormatResult | null {
  const n = Number(value);
  if (isNaN(n)) return null;
  const sign = n > 0 ? "positive" : n < 0 ? "negative" : "zero";
  const parts = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).formatToParts(Math.abs(n));
  return { n, sign, parts };
}
