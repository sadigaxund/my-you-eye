import { useRef, useLayoutEffect, useState } from "react";
import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { CodeBlock } from "../code-block";
import { ScrollArea } from "../scroll-area";
import { TreeView } from "../tree-view";
import type { TreeNode } from "../tree-view";
import { Badge } from "../badge";
import type { UrlReplacement } from "./CellType";

function safeStringify(value: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(value, (_, val) => {
    if (typeof val === "object" && val !== null) {
      if (seen.has(val)) return "[Circular]";
      seen.add(val);
    }
    if (typeof val === "bigint") return val.toString();
    return val;
  }, 2);
}

interface JsonToken {
  type: "key" | "string" | "number" | "boolean" | "null" | "punctuation" | "ellipsis" | "collapsed";
  value: string;
}

function valPreview(val: unknown): JsonToken[] {
  if (val === null || val === undefined) return [{ type: "null", value: "null" }];
  if (typeof val === "string") {
    const truncated = val.length > 24 ? val.slice(0, 22) + "…" : val;
    return [{ type: "string", value: `"${truncated}"` }];
  }
  if (typeof val === "number") return [{ type: "number", value: String(val) }];
  if (typeof val === "boolean") return [{ type: "boolean", value: String(val) }];
  if (Array.isArray(val)) {
    return [{ type: "collapsed", value: val.length === 0 ? "[]" : `[${val.length}]` }];
  }
  if (typeof val === "object") {
    const keys = Object.keys(val as Record<string, unknown>);
    return [{ type: "collapsed", value: keys.length === 0 ? "{}" : `{${keys.length}}` }];
  }
  return [{ type: "string", value: String(val) }];
}

function jsonPreview(value: unknown): { tokens: JsonToken[]; full: string } | null {
  if (typeof value !== "object" || value === null) return null;
  const full = safeStringify(value);
  const isArray = Array.isArray(value);
  const tokens: JsonToken[] = [];
  if (isArray) {
    const arr = value as unknown[];
    tokens.push({ type: "punctuation", value: "[" });
    arr.forEach((item, i) => {
      if (i > 0) tokens.push({ type: "punctuation", value: ", " });
      tokens.push(...valPreview(item));
    });
    tokens.push({ type: "punctuation", value: "]" });
  } else {
    const obj = value as Record<string, unknown>;
    tokens.push({ type: "punctuation", value: "{" });
    Object.entries(obj).forEach(([key, val], i) => {
      if (i > 0) tokens.push({ type: "punctuation", value: ", " });
      tokens.push({ type: "key", value: key });
      tokens.push({ type: "punctuation", value: ": " });
      tokens.push(...valPreview(val));
    });
    tokens.push({ type: "punctuation", value: "}" });
  }
  return { tokens, full };
}

const tokenStyles: Record<JsonToken["type"], string> = {
  key: "text-secondary-fg",
  string: "text-primary font-medium",
  number: "text-primary font-medium",
  boolean: "text-primary font-medium",
  null: "text-muted italic",
  punctuation: "text-muted",
  ellipsis: "text-muted",
  collapsed: "text-muted text-xs",
};

export function JsonDisplay({ value }: { value: unknown }) {
  if (typeof value !== "object" || value === null) {
    return <span className="text-muted">—</span>;
  }
  const count = Array.isArray(value) ? value.length : Object.keys(value as Record<string, unknown>).length;
  const preview = jsonPreview(value);
  if (!preview) return <span className="text-muted">—</span>;
  return (
    <Popover>
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors flex w-full max-w-full min-w-0 items-center gap-1.5">
        {count === 0 ? (
          <span className="text-muted italic">empty</span>
        ) : (
          <>
            <Badge variant="neutral" style="soft" className="text-xs px-1 py-0 leading-none shrink-0">
              {count} {Array.isArray(value) ? "items" : "keys"}
            </Badge>
            <span className="block min-w-0 flex-1 overflow-hidden whitespace-nowrap">
              {preview.tokens.map((t, i) => (
                <span key={i} className={tokenStyles[t.type]}>{t.value}</span>
              ))}
            </span>
            <span className="ml-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded bg-muted/10 text-xs font-bold leading-none text-muted">…</span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="p-0 overflow-hidden" style={{ minWidth: "var(--radix-popover-trigger-width)", maxWidth: "var(--radix-popover-trigger-width)" }}>
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-xs text-muted">JSON</span>
        </div>
        <ScrollArea className="max-h-72">
          <CodeBlock code={preview.full} />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function objToTreeNodes(obj: unknown, path = ""): TreeNode[] {
  if (obj === null || obj === undefined) return [{ id: `${path}_null`, label: "null", value: { type: "null" as const, value: null } }];
  if (Array.isArray(obj)) {
    if (obj.length === 0) return [{ id: `${path}_empty`, label: "[]", value: { type: "text" as const, value: "[]" } }];
    return obj.map((item, i) => {
      const id = `${path}_${i}`;
      if (typeof item === "object" && item !== null) return { id, label: `[${i}]`, children: objToTreeNodes(item, id), kind: "array" as const };
      return { id, label: `[${i}]`, value: { type: detectType(item), value: item } };
    });
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return [{ id: `${path}_empty`, label: "{}", value: { type: "text" as const, value: "{}" } }];
    return entries.map(([key, val]) => {
      const id = `${path}_${key}`;
      if (typeof val === "object" && val !== null) return { id, label: key, children: objToTreeNodes(val, id), kind: "object" as const };
      return { id, label: key, value: { type: detectType(val), value: val } };
    });
  }
  return [{ id: `${path}_val`, label: String(obj), value: { type: detectType(obj), value: obj } }];
}

function detectType(val: unknown): "text" | "number" | "boolean" | "null" | "email" | "url" {
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

export function TreeDisplay({ value, replacements }: { value: unknown; replacements?: UrlReplacement[] }) {
  if (typeof value !== "object" || value === null) return <span className="truncate inline-block max-w-full align-middle">{String(value)}</span>;
  const nodes = objToTreeNodes(value);
  const isArray = Array.isArray(value);
  const count = isArray ? value.length : Object.keys(value as Record<string, unknown>).length;
  const keys = isArray
    ? []
    : Object.keys(value as Record<string, unknown>);

  const previewRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const check = () => setIsTruncated(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors flex w-full max-w-full min-w-0 items-center gap-1.5">
        {count === 0 ? (
          <span className="text-muted italic">empty</span>
        ) : (
          <>
            <Badge variant="neutral" style="soft" className="text-xs px-1 py-0 leading-none shrink-0">
              {count} {isArray ? "items" : "keys"}
            </Badge>
            {keys.length > 0 && (
              <span
                ref={previewRef}
                className="block min-w-0 overflow-hidden whitespace-nowrap text-secondary-fg"
              >
                {keys.map((k, i) => (
                  <span key={k}>{i > 0 && <span className="text-muted">, </span>}{k}</span>
                ))}
              </span>
            )}
            {isTruncated && (
              <span className="ml-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded bg-muted/10 text-xs font-bold leading-none text-muted">…</span>
            )}
          </>
        )}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="p-0 overflow-hidden" style={{ minWidth: "var(--radix-popover-trigger-width)", maxWidth: "var(--radix-popover-trigger-width)" }}>
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-xs text-muted">Tree</span>
        </div>
        <ScrollArea className="max-h-72 p-2">
          <TreeView data={nodes} variant="condensed" indent={12} defaultExpandedDepth={2} replacements={replacements} />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function ArrayDisplay({ value }: { value: unknown }) {
  const arr = Array.isArray(value) ? value : [];
  const count = arr.length;

  const previewRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const check = () => setIsTruncated(el.scrollWidth > el.clientWidth);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors flex w-full max-w-full min-w-0 items-center gap-1.5">
        {count === 0 ? (
          <span className="text-muted italic">empty</span>
        ) : (
          <>
            <Badge variant="neutral" style="soft" className="text-xs px-1 py-0 leading-none shrink-0">
              {count} items
            </Badge>
            <span
              ref={previewRef}
              className="block min-w-0 overflow-hidden whitespace-nowrap text-secondary-fg"
            >
              {arr.map((item, i) => (
                <span key={i}>{i > 0 && <span className="text-muted">, </span>}{String(item)}</span>
              ))}
            </span>
            {isTruncated && (
              <span className="ml-0.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded bg-muted/10 text-xs font-bold leading-none text-muted">…</span>
            )}
          </>
        )}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="p-0 overflow-hidden" style={{ minWidth: "var(--radix-popover-trigger-width)", maxWidth: "var(--radix-popover-trigger-width)" }}>
        <div className="flex items-center justify-between px-3 pt-2">
          <span className="text-xs text-muted">List ({count})</span>
        </div>
        <ScrollArea className="max-h-72 p-2">
          <div className="flex flex-col gap-1">
            {arr.map((item, i) => (
              <Badge key={i} variant="neutral" style="soft">{String(item)}</Badge>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
