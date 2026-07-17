import { useCallback, useState } from "react";
import { cn } from "../../lib/cn";
import { Badge } from "../badge";
import { StatusDot } from "../status-dot";
import type { StatusDotProps } from "../status-dot";
import type { BadgeProps } from "../badge";
import { CodeBlock } from "../code-block";
import { Popover, PopoverTrigger, PopoverContent } from "../popover";

export type CellValueType =
  | "text"
  | "boolean"
  | "email"
  | "url"
  | "json"
  | "null"
  | "badge"
  | "status"
  | "number"
  | "date"
  | "datetime"
  | "bytes"
  | "duration"
  | "array";

export type UrlReplacement = { pattern: string | RegExp; label: string };

export interface CellValueProps {
  type?: CellValueType;
  value?: unknown;
  badgeVariant?: BadgeProps["variant"];
  badgeStyle?: BadgeProps["style"];
  statusVariant?: StatusDotProps["variant"];
  statusPulse?: boolean;
  replacements?: UrlReplacement[];
}

function BooleanDisplay({ value }: { value: unknown }) {
  const truthy = Boolean(value);
  return (
      <span className={cn("inline-flex items-center", truthy ? "text-success" : "text-muted")}>
        {truthy ? (
          <svg viewBox="0 0 12 12" className="size-icon fill-current">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      ) : (
          <svg viewBox="0 0 12 12" className="size-icon fill-current">
          <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      )}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [text]);
  return (
    <button
      type="button"
      onClick={copy}
      className="text-xs text-muted hover:text-fg cursor-pointer"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function JsonDisplay({ value }: { value: unknown }) {
  const str = JSON.stringify(value, null, 2);
  const preview = str.length > 50 ? str.slice(0, 50) + "…" : str;

  return (
    <Popover>
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors max-w-[120px] inline-block truncate align-middle">
        {preview}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="max-w-md p-0 overflow-hidden">
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-xs text-muted">JSON</span>
          <CopyButton text={str} />
        </div>
        <CodeBlock code={str} />
      </PopoverContent>
    </Popover>
  );
}

function applyReplacements(str: string, replacements?: UrlReplacement[]) {
  if (!replacements || replacements.length === 0) return str;
  let result = str;
  for (const r of replacements) {
    result = result.replaceAll(r.pattern, r.label);
  }
  return result;
}

function NumberDisplay({ value }: { value: unknown }) {
  const n = Number(value);
  if (isNaN(n)) return <span className="text-muted">—</span>;
  return (
    <span className="font-mono tabular-nums text-right block">
      {Intl.NumberFormat().format(n)}
    </span>
  );
}

function DateDisplay({ value, showTime }: { value: unknown; showTime?: boolean }) {
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return <span className="text-muted">—</span>;
  const abs = showTime
    ? d.toLocaleString()
    : d.toLocaleDateString();
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  let relative: string;
  if (diffSec < 60) relative = "just now";
  else if (diffMin < 60) relative = `${diffMin}m ago`;
  else if (diffHour < 24) relative = `${diffHour}h ago`;
  else if (diffDay < 30) relative = `${diffDay}d ago`;
  else relative = abs;
  return <span title={abs} className="cursor-help">{relative}</span>;
}

function BytesDisplay({ value }: { value: unknown }) {
  const n = Number(value);
  if (isNaN(n)) return <span className="text-muted">—</span>;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let size = n;
  while (size >= 1024 && i < units.length - 1) { size /= 1024; i++; }
  return <span className="font-mono tabular-nums">{size.toFixed(1)} {units[i]}</span>;
}

function DurationDisplay({ value }: { value: unknown }) {
  const sec = Number(value);
  if (isNaN(sec)) return <span className="text-muted">—</span>;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.round(sec % 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return <span className="font-mono tabular-nums">{parts.join(" ")}</span>;
}

function ArrayDisplay({ value }: { value: unknown }) {
  const arr = Array.isArray(value) ? value : [String(value)];
  return (
    <span className="inline-flex flex-wrap gap-1">
      {arr.map((item, i) => (
        <Badge key={i} variant="neutral" style="soft">{String(item)}</Badge>
      ))}
    </span>
  );
}

export function CellValue({
  type = "text",
  value,
  badgeVariant,
  badgeStyle,
  statusVariant,
  statusPulse,
  replacements,
}: CellValueProps) {
  if (value === null || value === undefined || type === "null") {
    return <span className="text-muted">—</span>;
  }

  switch (type) {
    case "boolean":
      return <BooleanDisplay value={value} />;

    case "email":
      return (
        <a
          href={`mailto:${String(value)}`}
          className="text-primary hover:underline"
        >
          {String(value)}
        </a>
      );

    case "url":
      return (
        <a
          href={String(value)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-tight text-primary hover:underline"
        >
          {applyReplacements(String(value), replacements)}
          <svg viewBox="0 0 12 12" className="size-icon-sm shrink-0 fill-current opacity-dim">
            <path d="M2 2h3v1H3v6h6V7h1v3H2V2zm4 0h4v4H9V4.5L6.5 7 6 6.5 8.5 4H6V2z" />
          </svg>
        </a>
      );

    case "json":
      return <JsonDisplay value={value} />;

    case "badge":
      return (
        <Badge variant={badgeVariant ?? "neutral"} style={badgeStyle ?? "solid"}>
          {String(value)}
        </Badge>
      );

    case "status":
      return (
        <span className="inline-flex items-center gap-1.5">
          <StatusDot variant={statusVariant ?? "neutral"} size="sm" pulse={statusPulse} />
          <span>{String(value)}</span>
        </span>
      );

    case "number":
      return <NumberDisplay value={value} />;

    case "date":
      return <DateDisplay value={value} />;

    case "datetime":
      return <DateDisplay value={value} showTime />;

    case "bytes":
      return <BytesDisplay value={value} />;

    case "duration":
      return <DurationDisplay value={value} />;

    case "array":
      return <ArrayDisplay value={value} />;

    default:
      return <span>{String(value)}</span>;
  }
}
