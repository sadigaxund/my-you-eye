// Chart-wide number formatting — thin wrappers over src/lib/format.ts (the
// single source of Intl formatting logic; see AGENTS.md batch 4 brief: "do
// not re-implement Intl formatting, it already exists there"). format.ts
// returns Intl.NumberFormatPart[] for styled (multi-span) rendering; axis
// ticks and plain tooltip text just need the flattened string.
import {
  formatNumberParts,
  formatPercentageParts,
  formatBytesParts,
  formatCurrencyParts,
} from "../../../lib/format";

function join(parts: Intl.NumberFormatPart[] | null): string {
  return parts ? parts.map((p) => p.value).join("") : "";
}

export function formatCompactNumber(value: number): string {
  return join(formatNumberParts(value, { compact: true })?.parts ?? null);
}

export function formatTickNumber(value: number): string {
  return join(formatNumberParts(value)?.parts ?? null);
}

export function formatTickPercentage(value: number, fractionDigits = 0): string {
  return join(formatPercentageParts(value, fractionDigits)?.parts ?? null);
}

export function formatTickBytes(value: number): string {
  const r = formatBytesParts(value, { compact: true });
  return r ? `${join(r.parts)}${r.unitLabel}` : "";
}

export function formatTickCurrency(value: number, currency?: string): string {
  return join(formatCurrencyParts(value, { compact: true, currency })?.parts ?? null);
}
