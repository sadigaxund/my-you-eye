import { useState } from "react";
import { cn } from "../../lib/cn";
import { Badge } from "../badge";
import { StatusDot } from "../status-dot";
import type { StatusDotProps } from "../status-dot";
import type { BadgeProps } from "../badge";

export type CellValueType =
  | "text"
  | "boolean"
  | "email"
  | "url"
  | "json"
  | "null"
  | "badge"
  | "status";

export interface CellValueProps {
  type?: CellValueType;
  value: unknown;
  badgeVariant?: BadgeProps["variant"];
  badgeStyle?: BadgeProps["style"];
  statusVariant?: StatusDotProps["variant"];
  statusPulse?: boolean;
}

function BooleanDisplay({ value }: { value: unknown }) {
  const truthy = Boolean(value);
  return (
    <span className={cn("inline-flex items-center", truthy ? "text-success" : "text-muted")}>
      {truthy ? (
        <svg viewBox="0 0 12 12" className="size-3.5 fill-current">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" className="size-3.5 fill-current">
          <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      )}
    </span>
  );
}

function JsonDisplay({ value }: { value: unknown }) {
  const [expanded, setExpanded] = useState(false);
  const str = JSON.stringify(value, null, 2);
  const preview = str.length > 50 ? str.slice(0, 50) + "…" : str;

  return (
    <button
      type="button"
      onClick={() => setExpanded(!expanded)}
      className="text-left font-mono text-xs cursor-pointer hover:text-primary transition-colors"
    >
      {expanded ? (
        <pre className="whitespace-pre-wrap m-0">{str}</pre>
      ) : (
        <span>{preview}</span>
      )}
    </button>
  );
}

export function CellValue({
  type = "text",
  value,
  badgeVariant,
  badgeStyle,
  statusVariant,
  statusPulse,
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
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          {String(value)}
          <svg viewBox="0 0 12 12" className="size-3 shrink-0 fill-current opacity-60">
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
