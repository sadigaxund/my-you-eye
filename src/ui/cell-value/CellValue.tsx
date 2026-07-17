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
  | "status";

export type UrlReplacement = { pattern: string | RegExp; label: string };

export interface CellValueProps {
  type?: CellValueType;
  value: unknown;
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

function JsonDisplay({ value }: { value: unknown }) {
  const str = JSON.stringify(value, null, 2);
  const preview = str.length > 50 ? str.slice(0, 50) + "…" : str;

  return (
    <Popover>
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors max-w-[120px] inline-block truncate align-middle">
        {preview}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="max-w-md p-0 overflow-hidden">
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

    default:
      return <span>{String(value)}</span>;
  }
}
