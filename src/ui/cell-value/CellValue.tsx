import { useCallback, useState, useRef } from "react";
import { cn } from "../../lib/cn";
import { Badge } from "../badge";
import { StatusDot } from "../status-dot";
import type { StatusDotProps } from "../status-dot";
import type { BadgeProps } from "../badge";
import { CodeBlock } from "../code-block";
import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { Dialog, DialogContent, DialogTitle } from "../dialog";
import { ScrollArea } from "../scroll-area";
import { TreeView } from "../tree-view";
import type { TreeNode } from "../tree-view";
import { DateHumanDisplay, DateSystemDisplay, DateTimeTzDisplay } from "./CellValue.date-displays";

export type CellValueType =
  | "text" | "boolean" | "email" | "url" | "json" | "null" | "badge" | "status"
  | "number" | "percentage" | "date-human" | "date-system" | "datetime-tz"
  | "bytes" | "duration" | "array"
  | "image" | "audio" | "tree";

export type UrlReplacement = { pattern: string | RegExp; label: string };

export interface CellValueProps {
  type?: CellValueType;
  value?: unknown;
  badgeVariant?: BadgeProps["variant"];
  badgeStyle?: BadgeProps["style"];
  statusVariant?: StatusDotProps["variant"];
  statusPulse?: boolean;
  replacements?: UrlReplacement[];
  dateFormat?: Intl.DateTimeFormatOptions;
}

function BooleanDisplay({ value }: { value: unknown }) {
  const t = Boolean(value);
  return (
    <span className={cn("inline-flex items-center", t ? "text-success" : "text-muted")}>
      <svg viewBox="0 0 12 12" className="size-icon fill-current">
        {t ? <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          : <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" fill="none" />}
      </svg>
    </span>
  );
}

function JsonDisplay({ value }: { value: unknown }) {
  const str = JSON.stringify(value, null, 2);
  const preview = str.length > 50 ? str.slice(0, 50) + "…" : str;
  return (
    <Popover>
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors max-w-60 inline-block truncate align-middle">{preview}</PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="max-w-md p-0 overflow-hidden">
        <CodeBlock code={str} />
      </PopoverContent>
    </Popover>
  );
}

function applyReplacements(str: string, replacements?: UrlReplacement[]) {
  if (!replacements) return str;
  let r = str;
  for (const x of replacements) r = r.replaceAll(x.pattern, x.label);
  return r;
}

function NumberDisplay({ value }: { value: unknown }) {
  const n = Number(value);
  if (isNaN(n)) return <span className="text-muted">—</span>;
  return <span className="font-mono tabular-nums truncate inline-block max-w-full align-middle">{Intl.NumberFormat().format(n)}</span>;
}

function PercentageDisplay({ value }: { value: unknown }) {
  const n = Number(value);
  if (isNaN(n)) return <span className="text-muted">—</span>;
  return <span className="font-mono tabular-nums truncate inline-block max-w-full align-middle">{(n * 100).toFixed(1)}%</span>;
}

function BytesDisplay({ value }: { value: unknown }) {
  const n = Number(value);
  if (isNaN(n)) return <span className="text-muted">—</span>;
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0, s = n;
  while (s >= 1024 && i < units.length - 1) { s /= 1024; i++; }
  return <span className="font-mono tabular-nums truncate inline-block max-w-full align-middle">{s.toFixed(1)} {units[i]}</span>;
}

function DurationDisplay({ value }: { value: unknown }) {
  const sec = Number(value);
  if (isNaN(sec)) return <span className="text-muted">—</span>;
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.round(sec % 60);
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return <span className="font-mono tabular-nums truncate inline-block max-w-full align-middle">{parts.join(" ")}</span>;
}

function ImageDisplay({ value }: { value: unknown }) {
  const src = String(value);
  const [open, setOpen] = useState(false);
  return (
    <>
      <img src={src} alt="" className="size-8 rounded-ui-sm object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setOpen(true)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden max-w-[90vw] w-auto">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          <img src={src} alt="" className="max-w-[80vw] max-h-[80vh] object-contain" />
        </DialogContent>
      </Dialog>
    </>
  );
}

function AudioDisplay({ value }: { value: unknown }) {
  const src = String(value);
  const r = useRef<HTMLAudioElement>(null);
  const [p, setP] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);
  const toggle = useCallback(() => {
    const a = r.current; if (!a) return;
    if (p) { a.pause(); setP(false); return; }
    if (a.ended || a.currentTime >= a.duration - 0.01) a.currentTime = 0;
    a.play(); setP(true);
  }, [p]);
  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const a = r.current; if (!a) return;
    a.currentTime = Number(e.target.value);
    setT(a.currentTime);
  }, []);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  return (
    <span className="inline-flex items-center gap-2 text-xs min-w-48" onClick={(e) => e.stopPropagation()}>
      <audio ref={r} src={src} onTimeUpdate={() => setT(r.current?.currentTime ?? 0)} onLoadedMetadata={() => setD(r.current?.duration ?? 0)} onEnded={() => setP(false)} />
      <button type="button" onClick={toggle}
        className="size-6 shrink-0 flex items-center justify-center rounded-full bg-primary text-primary-fg cursor-pointer hover:opacity-80 transition-opacity">
        {p ? <svg viewBox="0 0 10 10" className="size-3 fill-current"><rect x="1" y="1" width="3" height="8" rx="0.5" /><rect x="6" y="1" width="3" height="8" rx="0.5" /></svg>
          : <svg viewBox="0 0 10 10" className="size-3 fill-current"><path d="M2 1l7 4-7 4V1z" /></svg>}
      </button>
      <input type="range" min={0} max={d || 1} step={0.1} value={t} onChange={seek}
        className="flex-1 h-1 accent-primary cursor-pointer" />
      <span className="font-mono tabular-nums text-muted shrink-0 w-24 text-right whitespace-nowrap">{d ? `${fmt(t)} / ${fmt(d)}` : "--:-- / --:--"}</span>
    </span>
  );
}

function ArrayDisplay({ value }: { value: unknown }) {
  const arr = Array.isArray(value) ? value : [String(value)];
  return <span className="inline-flex flex-wrap gap-1">{arr.map((item, i) => <Badge key={i} variant="neutral" style="soft">{String(item)}</Badge>)}</span>;
}

function detectType(val: unknown): CellValueType {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return "boolean";
  if (typeof val === "number") return "number";
  if (typeof val === "string") {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "email";
    if (/^https?:\/\//.test(val)) return "url";
    return "text";
  }
  return "text";
}

function objToTreeNodes(obj: unknown, path = ""): TreeNode[] {
  if (obj === null || obj === undefined) return [{ id: `${path}_null`, label: "null", value: { type: "null", value: null } }];
  if (Array.isArray(obj)) {
    if (obj.length === 0) return [{ id: `${path}_empty`, label: "[]", value: { type: "text", value: "[]" } }];
    return obj.map((item, i) => {
      const id = `${path}_${i}`;
      if (typeof item === "object" && item !== null) return { id, label: `[${i}]`, children: objToTreeNodes(item, id), kind: "array" as const };
      return { id, label: `[${i}]`, value: { type: detectType(item), value: item } };
    });
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return [{ id: `${path}_empty`, label: "{}", value: { type: "text", value: "{}" } }];
    return entries.map(([key, val]) => {
      const id = `${path}_${key}`;
      if (typeof val === "object" && val !== null) return { id, label: key, children: objToTreeNodes(val, id), kind: "object" as const };
      return { id, label: key, value: { type: detectType(val), value: val } };
    });
  }
  return [{ id: `${path}_val`, label: String(obj), value: { type: detectType(obj), value: obj } }];
}

function TreeDisplay({ value, replacements }: { value: unknown; replacements?: UrlReplacement[] }) {
  if (typeof value !== "object" || value === null) return <span className="truncate inline-block max-w-full align-middle">{String(value)}</span>;
  const nodes = objToTreeNodes(value);
  const isArray = Array.isArray(value);
  const count = isArray ? value.length : Object.keys(value as object).length;
  const summary = isArray ? `[${count}]` : `{${count}}`;
  return (
    <Popover>
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors">{summary}</PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="max-w-md p-0 overflow-hidden">
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-xs text-muted">Tree</span>
        </div>
        <ScrollArea className="max-h-[300px] p-2">
          <TreeView data={nodes} variant="condensed" indent={12} defaultExpandedDepth={2} replacements={replacements} />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function CellValue({
  type = "text", value, badgeVariant, badgeStyle, statusVariant, statusPulse, replacements, dateFormat,
}: CellValueProps) {
  if (value === null || value === undefined || type === "null") return <span className="text-muted">—</span>;
  switch (type) {
    case "boolean": return <BooleanDisplay value={value} />;
    case "email": return <a href={`mailto:${String(value)}`} className="text-primary hover:underline inline-flex min-w-0"><span className="truncate">{String(value)}</span></a>;
    case "url": return <a href={String(value)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-tight text-primary hover:underline min-w-0">
      <span className="truncate">{applyReplacements(String(value), replacements)}</span>
      <svg viewBox="0 0 12 12" className="size-icon-sm shrink-0 fill-current opacity-dim"><path d="M2 2h3v1H3v6h6V7h1v3H2V2zm4 0h4v4H9V4.5L6.5 7 6 6.5 8.5 4H6V2z" /></svg></a>;
    case "json": return <JsonDisplay value={value} />;
    case "badge": return <Badge variant={badgeVariant ?? "neutral"} style={badgeStyle ?? "solid"}>{String(value)}</Badge>;
    case "status": return <span className="inline-flex items-center gap-1.5 min-w-0"><StatusDot variant={statusVariant ?? "neutral"} size="sm" pulse={statusPulse} /><span className="truncate">{String(value)}</span></span>;
    case "number": return <NumberDisplay value={value} />;
    case "percentage": return <PercentageDisplay value={value} />;
    case "date-human": return <DateHumanDisplay value={value} />;
    case "date-system": return <DateSystemDisplay value={value} dateFormat={dateFormat} />;
    case "datetime-tz": return <DateTimeTzDisplay value={value} />;
    case "bytes": return <BytesDisplay value={value} />;
    case "duration": return <DurationDisplay value={value} />;
    case "image": return <ImageDisplay value={value} />;
    case "audio": return <AudioDisplay value={value} />;
    case "array": return <ArrayDisplay value={value} />;
    case "tree": return <TreeDisplay value={value} replacements={replacements} />;
    default: return <span className="truncate inline-block max-w-full align-middle">{String(value)}</span>;
  }
}
