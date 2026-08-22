import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { TreeView } from ".";
import type { TreeNode } from ".";

function FolderIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-full fill-none stroke-current">
      <path d="M2 4a1 1 0 011-1h3l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-full fill-none stroke-current">
      <path d="M4 2h5l3 3v9a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M9 2v3h3" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function ControlledTreeViewDemo() {
  const [expanded, setExpanded] = useState(new Set(["1", "2"]));
  return (
    <div>
      <div className="flex gap-2 mb-3 px-2">
        <button
          type="button"
          onClick={() => setExpanded(new Set(["1", "1-1", "1-2", "2", "2-1"]))}
          className="px-2 py-1 text-xs rounded-ui border border-border bg-bg cursor-pointer"
        >
          Expand all
        </button>
        <button
          type="button"
          onClick={() => setExpanded(new Set())}
          className="px-2 py-1 text-xs rounded-ui border border-border bg-bg cursor-pointer"
        >
          Collapse all
        </button>
      </div>
      <div className="max-h-[27.5rem] overflow-y-auto overscroll-contain px-2 py-1">
        <TreeView
          data={sampleData}
          expandedKeys={expanded}
          onToggle={(id) => {
            setExpanded((prev) => {
              const next = new Set(prev);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            });
          }}
        />
      </div>
    </div>
  );
}

const sampleData: TreeNode[] = [
  { id: "1", label: "users", kind: "array", children: [
    { id: "1-1", label: "[0]", kind: "object", children: [
      { id: "1-1-1", label: "name", value: { type: "text", value: "John" } },
      { id: "1-1-2", label: "active", value: { type: "boolean", value: true } },
      { id: "1-1-3", label: "role", value: { type: "badge", value: "Admin", badgeVariant: "primary" } },
    ] },
    { id: "1-2", label: "[1]", kind: "object", children: [
      { id: "1-2-1", label: "name", value: { type: "text", value: "Jane" } },
      { id: "1-2-2", label: "active", value: { type: "boolean", value: false } },
      { id: "1-2-3", label: "status", value: { type: "status", value: "Away", statusVariant: "warning" } },
    ] },
  ] },
  { id: "2", label: "config", kind: "object", children: [
    { id: "2-1", label: "limits", kind: "object", children: [
      { id: "2-1-1", label: "maxConnections", value: { type: "number", value: 100 } },
      { id: "2-1-2", label: "timeout", value: { type: "number", value: 30000 } },
      { id: "2-1-3", label: "retryDelay", value: { type: "duration", value: 5 } },
    ] },
    { id: "2-2", label: "tags", kind: "array", children: [
      { id: "2-2-1", label: "[0]", value: { type: "text", value: "production" } },
      { id: "2-2-2", label: "[1]", value: { type: "text", value: "us-east" } },
    ] },
    { id: "2-3", label: "emptyArr", kind: "array", children: [] },
    { id: "2-4", label: "emptyObj", kind: "object", children: [] },
  ] },
  { id: "3", label: "version", value: { type: "text", value: "2.4.1" } },
  { id: "4", label: "enabled", value: { type: "boolean", value: true } },
  { id: "5", label: "ratio", value: { type: "percentage", value: 0.75 } },
  { id: "6", label: "null_field", value: { type: "null" } },
  { id: "7", label: "lastLogin", value: { type: "date-human", value: 1710000000000 } },
  { id: "8", label: "avatar", value: { type: "url", value: "https://example.com/avatar.png" } },
];

const iconData: TreeNode[] = [
  { id: "src", label: "src", icon: <FolderIcon />, children: [
    { id: "ui", label: "ui", icon: <FolderIcon />, children: [
      { id: "button-tsx", label: "Button.tsx", icon: <FileIcon />, value: { type: "text", value: "2.1 kb" } },
      { id: "badge-tsx", label: "Badge.tsx", icon: <FileIcon />, value: { type: "text", value: "1.4 kb" } },
    ] },
    { id: "index-ts", label: "index.ts", icon: <FileIcon />, value: { type: "text", value: "0.3 kb" } },
  ] },
  { id: "readme", label: "README.md", icon: <FileIcon />, value: { type: "text", value: "4.8 kb" } },
];

const messyPayload: TreeNode[] = [
  { id: "m1", label: "deploy", kind: "object", children: [
    { id: "m1-1", label: "environments", kind: "array", children: [
      { id: "m1-1-1", label: "[0]", kind: "object", children: [
        { id: "m1-1-1-1", label: "name", value: { type: "text", value: "staging" } },
        { id: "m1-1-1-2", label: "url", value: { type: "url", value: "https://staging.example.com" } },
        { id: "m1-1-1-3", label: "active", value: { type: "boolean", value: true } },
      ] },
      { id: "m1-1-2", label: "[1]", kind: "object", children: [
        { id: "m1-1-2-1", label: "name", value: { type: "text", value: "production" } },
        { id: "m1-1-2-2", label: "url", value: { type: "url", value: "https://example.com" } },
        { id: "m1-1-2-3", label: "active", value: { type: "boolean", value: false } },
      ] },
    ] },
    { id: "m1-2", label: "features", kind: "object", children: [
      { id: "m1-2-1", label: "darkMode", value: { type: "boolean", value: true } },
      { id: "m1-2-2", label: "maxRetries", value: { type: "number", value: 3 } },
      { id: "m1-2-3", label: "description", value: { type: "text", value: "Main deployment config" } },
    ] },
    { id: "m1-3", label: "emptyArr", kind: "array", children: [] },
    { id: "m1-4", label: "emptyObj", kind: "object", children: [] },
    { id: "m1-5", label: "nullValue", value: { type: "null" } },
  ] },
  { id: "m2", label: "metrics", kind: "array", children: [
    { id: "m2-1", label: "[0]", value: { type: "number", value: 42 } },
    { id: "m2-2", label: "[1]", value: { type: "number", value: 7 } },
    { id: "m2-3", label: "[2]", value: { type: "number", value: 99 } },
  ] },
];

const tallData: TreeNode[] = [
  {
    id: "t1", label: "media", kind: "object",
    children: [
      { id: "t1-1", label: "track", value: { type: "audio", value: "https://example.com/track.mp3" } },
      { id: "t1-2", label: "title", value: { type: "text", value: "Interlude" } },
      { id: "t1-4", label: "cover", value: { type: "image", value: "https://picsum.photos/seed/treeview/80/80" } },
      {
        id: "t1-3", label: "metadata", kind: "object",
        children: [
          { id: "t1-3-1", label: "config", value: { type: "json", value: { bitrate: 320, channels: 2, format: "mp3" } } },
          { id: "t1-3-2", label: "duration", value: { type: "duration", value: 214 } },
        ],
      },
    ],
  },
  { id: "t2", label: "narration", value: { type: "audio", value: "https://example.com/narration.mp3" } },
];

const explorerData: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: <FolderIcon />,
    children: [
      { id: "main", label: "main.tsx", icon: <FileIcon /> },
      { id: "styles", label: "styles.css", tone: "warning", icon: <FileIcon /> },
      { id: "deleted", label: "legacy.tsx", tone: "danger", icon: <FileIcon /> },
    ],
  },
  { id: "readme", label: "README.md", icon: <FileIcon /> },
  { id: "notes", label: "scratch/", tone: "muted", icon: <FolderIcon />, children: [{ id: "todo", label: "todo.md", icon: <FileIcon /> }] },
];

function SelectionDemo() {
  const [selectedId, setSelectedId] = useState<string | undefined>("main");
  return (
    <div className="mx-auto max-w-xs">
      <TreeView data={explorerData} defaultExpandedDepth={2} selectedId={selectedId} onSelect={(n) => setSelectedId(n.id)} />
      <p className="mt-2 text-xs text-muted text-center">Selected: {selectedId ?? "none"} — tones mark modified (amber) and deleted (struck) files.</p>
    </div>
  );
}

function RenameDemo() {
  const [data, setData] = useState<TreeNode[]>([
    { id: "doc", label: "architecture.md", icon: <FileIcon /> },
    { id: "guide", label: "getting-started.md", icon: <FileIcon /> },
  ]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-xs">
      <TreeView
        data={data}
        renamingId={renamingId}
        onRenameCommit={(node, newName) => {
          setData((prev) => prev.map((n) => (n.id === node.id ? { ...n, id: newName, label: newName } : n)));
          setRenamingId(null);
        }}
        onRenameCancel={() => setRenamingId(null)}
        onSelect={(n) => {
          if (n.id !== renamingId) setRenamingId(n.id);
        }}
      />
      <p className="mt-2 text-xs text-muted text-center">Click a row to rename it in place — Enter commits, Escape cancels.</p>
    </div>
  );
}

function DragDemo() {
  const [data, setData] = useState<TreeNode[]>([
    { id: "docs", label: "docs", icon: <FolderIcon />, children: [{ id: "a", label: "a.md", icon: <FileIcon /> }] },
    { id: "b", label: "b.md", icon: <FileIcon /> },
  ]);
  return (
    <div className="mx-auto max-w-xs">
      <TreeView
        data={data}
        defaultExpandedDepth={2}
        draggable
        onMove={(sourceId, targetId) => {
          const detach = (nodes: TreeNode[]): TreeNode[] =>
            nodes
              .filter((n) => n.id !== sourceId)
              .map((n) => (n.children ? { ...n, children: detach(n.children) } : n));
          const attach = (nodes: TreeNode[]): TreeNode[] =>
            nodes.map((n) => (n.id === targetId && n.children ? { ...n, children: [...detach(n.children), ...pluck(data, sourceId)] } : n));
          setData(() => attach(detach(data)));
        }}
      />
      <p className="mt-2 text-xs text-muted text-center">Drag rows onto folders to move them; self/descendant drops are refused.</p>
    </div>
  );
}

function pluck(nodes: TreeNode[], id: string): TreeNode[] {
  for (const n of nodes) {
    if (n.id === id) return [n];
    const hit = n.children ? pluck(n.children, id) : [];
    if (hit.length) return hit;
  }
  return [];
}

const entry: ShowcaseEntry = {
  title: "TreeView",
  group: "data",
  description: "A collapsible hierarchical list for nested data, with indent guide lines, controlled expand/collapse, arrow-key navigation, typed value rendering, and controlled selection with rename and drag hooks.",
  demos: [
    {
      name: "Density (normal vs compact)",
      description: "density=\"compact\" is the current name; variant=\"condensed\" (right column) still works as a deprecated alias.",
      render: () => (
        <div className="flex items-stretch gap-6">
          <div className="flex-1 min-w-0 px-2">
            <p className="text-xs text-muted mb-1 font-mono">density=&quot;normal&quot;</p>
            <TreeView data={sampleData} defaultExpandedDepth={2} />
          </div>
          <div className="w-px bg-border shrink-0" />
          <div className="flex-1 min-w-0 px-2">
            <p className="text-xs text-muted mb-1 font-mono">density=&quot;compact&quot;</p>
            <TreeView data={sampleData} density="compact" defaultExpandedDepth={2} />
          </div>
          <div className="w-px bg-border shrink-0" />
          <div className="flex-1 min-w-0 px-2">
            <p className="text-xs text-muted mb-1 font-mono">variant=&quot;condensed&quot; (deprecated)</p>
            <TreeView data={sampleData} variant="condensed" defaultExpandedDepth={2} />
          </div>
        </div>
      ),
    },
    {
      name: "Tall values (elbow/chevron alignment)",
      description: "Audio players and JSON popover triggers render taller than a text line, yet the elbow connector still meets the chevron's vertical center at every row, in both density and indent sizes, because row-content height is a fixed --grid-unit multiple rather than the height of the tallest value. The \"cover\" image value is sized to size-thumb-sm (20px) inside TreeView so it fits the row instead of overflowing at size-thumb's 32px.",
      render: () => (
        <div className="flex items-start gap-6">
          <div className="flex-1 min-w-0 px-2">
            <p className="text-xs text-muted mb-1 font-mono">indent=&quot;md&quot;, density=&quot;normal&quot;</p>
            <TreeView data={tallData} defaultExpandedDepth={3} />
          </div>
          <div className="flex-1 min-w-0 px-2">
            <p className="text-xs text-muted mb-1 font-mono">indent=&quot;lg&quot;, density=&quot;compact&quot;</p>
            <TreeView data={tallData} indent="lg" density="compact" defaultExpandedDepth={3} />
          </div>
        </div>
      ),
    },
    {
      name: "Depth-based expand",
      render: () => (
        <div className="flex items-start gap-6">
          <div className="flex-1 min-w-0 px-2">
            <p className="text-xs text-muted mb-1 font-mono">depth: 1</p>
            <TreeView data={sampleData} defaultExpandedDepth={1} />
          </div>
          <div className="flex-1 min-w-0 px-2">
            <p className="text-xs text-muted mb-1 font-mono">depth: 2</p>
            <TreeView data={sampleData} defaultExpandedDepth={2} />
          </div>
        </div>
      ),
    },
    {
      name: "Controlled expand state",
      overflow: "auto",
      render: () => <ControlledTreeViewDemo />,
    },
    {
      name: "Leading icons (click a row, then use arrow keys)",
      render: () => (
        <div className="px-2">
          <TreeView data={iconData} defaultExpandedDepth={2} />
        </div>
      ),
    },
    {
      name: "Messy nested payload (hover to trace depth guides)",
      render: () => (
        <div className="px-2">
          <TreeView data={messyPayload} defaultExpandedDepth={1} />
        </div>
      ),
    },
    {
      name: "Controlled selection & tones",
      description:
        "selectedId is decoupled from keyboard focus; tone tints labels with semantic tokens (danger strikes through).",
      render: () => <SelectionDemo />,
    },
    {
      name: "Inline rename",
      render: () => <RenameDemo />,
    },
    {
      name: "Drag to move",
      render: () => <DragDemo />,
    },
  ],
};
export default entry;
