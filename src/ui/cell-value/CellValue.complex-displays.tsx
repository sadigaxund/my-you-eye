import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { CodeBlock } from "../code-block";
import { ScrollArea } from "../scroll-area";
import { TreeView } from "../tree-view";
import type { TreeNode } from "../tree-view";
import { Badge } from "../badge";

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
    const show = arr.slice(0, 3);
    show.forEach((item, i) => {
      if (i > 0) tokens.push({ type: "punctuation", value: ", " });
      tokens.push(...valPreview(item));
    });
    if (arr.length > 3) {
      tokens.push({ type: "punctuation", value: ", " });
      tokens.push({ type: "ellipsis", value: "…" });
    }
    tokens.push({ type: "punctuation", value: "]" });
  } else {
    const obj = value as Record<string, unknown>;
    tokens.push({ type: "punctuation", value: "{" });
    const entries = Object.entries(obj).slice(0, 3);
    entries.forEach(([key, val], i) => {
      if (i > 0) tokens.push({ type: "punctuation", value: ", " });
      tokens.push({ type: "key", value: key });
      tokens.push({ type: "punctuation", value: ": " });
      tokens.push(...valPreview(val));
    });
    if (Object.keys(obj).length > 3) {
      tokens.push({ type: "punctuation", value: ", " });
      tokens.push({ type: "ellipsis", value: "…" });
    }
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
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors max-w-60 inline-flex items-center gap-1.5 truncate align-middle">
        {count === 0 ? (
          <span className="text-muted italic">empty</span>
        ) : (
          <>
            <Badge variant="neutral" style="soft" className="text-[10px] px-1 py-0 leading-none shrink-0">
              {count} {Array.isArray(value) ? "items" : "keys"}
            </Badge>
            <span className="truncate">
              {preview.tokens.map((t, i) => (
                <span key={i} className={tokenStyles[t.type]}>{t.value}</span>
              ))}
            </span>
          </>
        )}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="max-w-md p-0 overflow-hidden">
        <CodeBlock code={preview.full} />
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

export function TreeDisplay({ value, replacements }: { value: unknown; replacements?: unknown[] }) {
  if (typeof value !== "object" || value === null) return <span className="truncate inline-block max-w-full align-middle">{String(value)}</span>;
  const nodes = objToTreeNodes(value);
  const isArray = Array.isArray(value);
  const count = isArray ? value.length : Object.keys(value as Record<string, unknown>).length;
  const keys = isArray
    ? []
    : Object.keys(value as Record<string, unknown>).slice(0, 4);

  return (
    <Popover>
      <PopoverTrigger className="font-mono text-xs cursor-pointer hover:text-primary transition-colors max-w-60 inline-flex items-center gap-1.5 truncate align-middle">
        {count === 0 ? (
          <span className="text-muted italic">empty</span>
        ) : (
          <>
            <Badge variant="neutral" style="soft" className="text-[10px] px-1 py-0 leading-none shrink-0">
              {count}
            </Badge>
            {keys.length > 0 && (
              <span className="truncate text-secondary">
                {keys.map((k, i) => (
                  <span key={k}>{i > 0 && <span className="text-muted">, </span>}{k}</span>
                ))}
                {Object.keys(value as Record<string, unknown>).length > 4 && <span className="text-muted">…</span>}
              </span>
            )}
            {isArray && count > 0 && (
              <span className="text-muted">{count} items</span>
            )}
          </>
        )}
      </PopoverTrigger>
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
