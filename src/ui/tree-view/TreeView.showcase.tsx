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
    <div className="max-w-xl">
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
      <div className="h-[440px] px-2">
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
  {
    id: "1",
    label: "users",
    kind: "array",
    children: [
      {
        id: "1-1", label: "[0]", kind: "object",
        children: [
          { id: "1-1-1", label: "name", value: { type: "text", value: "John" } },
          { id: "1-1-2", label: "active", value: { type: "boolean", value: true } },
          { id: "1-1-3", label: "role", value: { type: "badge", value: "Admin", badgeVariant: "primary" } },
        ],
      },
      {
        id: "1-2", label: "[1]", kind: "object",
        children: [
          { id: "1-2-1", label: "name", value: { type: "text", value: "Jane" } },
          { id: "1-2-2", label: "active", value: { type: "boolean", value: false } },
          { id: "1-2-3", label: "status", value: { type: "status", value: "Away", statusVariant: "warning" } },
        ],
      },
    ],
  },
  {
    id: "2",
    label: "config",
    kind: "object",
    children: [
      {
        id: "2-1",
        label: "limits",
        kind: "object",
        children: [
          { id: "2-1-1", label: "maxConnections", value: { type: "number", value: 100 } },
          { id: "2-1-2", label: "timeout", value: { type: "number", value: 30000 } },
          { id: "2-1-3", label: "retryDelay", value: { type: "duration", value: 5 } },
        ],
      },
      {
        id: "2-2",
        label: "tags",
        kind: "array",
        children: [
          { id: "2-2-1", label: "[0]", value: { type: "text", value: "production" } },
          { id: "2-2-2", label: "[1]", value: { type: "text", value: "us-east" } },
        ],
      },
      { id: "2-3", label: "emptyArr", kind: "array", children: [] },
      { id: "2-4", label: "emptyObj", kind: "object", children: [] },
    ],
  },
  { id: "3", label: "version", value: { type: "text", value: "2.4.1" } },
  { id: "4", label: "enabled", value: { type: "boolean", value: true } },
  { id: "5", label: "ratio", value: { type: "percentage", value: 0.75 } },
  { id: "6", label: "null_field", value: { type: "null" } },
  { id: "7", label: "lastLogin", value: { type: "date", value: 1710000000000 } },
  { id: "8", label: "avatar", value: { type: "url", value: "https://example.com/avatar.png" } },
];

const iconData: TreeNode[] = [
  {
    id: "src",
    label: "src",
    icon: <FolderIcon />,
    children: [
      {
        id: "ui",
        label: "ui",
        icon: <FolderIcon />,
        children: [
          { id: "button-tsx", label: "Button.tsx", icon: <FileIcon />, value: { type: "text", value: "2.1 kb" } },
          { id: "badge-tsx", label: "Badge.tsx", icon: <FileIcon />, value: { type: "text", value: "1.4 kb" } },
        ],
      },
      { id: "index-ts", label: "index.ts", icon: <FileIcon />, value: { type: "text", value: "0.3 kb" } },
    ],
  },
  { id: "readme", label: "README.md", icon: <FileIcon />, value: { type: "text", value: "4.8 kb" } },
];

const messyPayload: TreeNode[] = [
  {
    id: "m1", label: "deploy", kind: "object",
    children: [
      {
        id: "m1-1", label: "environments", kind: "array",
        children: [
          {
            id: "m1-1-1", label: "[0]", kind: "object",
            children: [
              { id: "m1-1-1-1", label: "name", value: { type: "text", value: "staging" } },
              { id: "m1-1-1-2", label: "url", value: { type: "url", value: "https://staging.example.com" } },
              { id: "m1-1-1-3", label: "active", value: { type: "boolean", value: true } },
            ],
          },
          {
            id: "m1-1-2", label: "[1]", kind: "object",
            children: [
              { id: "m1-1-2-1", label: "name", value: { type: "text", value: "production" } },
              { id: "m1-1-2-2", label: "url", value: { type: "url", value: "https://example.com" } },
              { id: "m1-1-2-3", label: "active", value: { type: "boolean", value: false } },
            ],
          },
        ],
      },
      { id: "m1-2", label: "features", kind: "object",
        children: [
          { id: "m1-2-1", label: "darkMode", value: { type: "boolean", value: true } },
          { id: "m1-2-2", label: "maxRetries", value: { type: "number", value: 3 } },
          { id: "m1-2-3", label: "description", value: { type: "text", value: "Main deployment config" } },
        ],
      },
      { id: "m1-3", label: "emptyArr", kind: "array", children: [] },
      { id: "m1-4", label: "emptyObj", kind: "object", children: [] },
      { id: "m1-5", label: "nullValue", value: { type: "null" } },
    ],
  },
  { id: "m2", label: "metrics", kind: "array",
    children: [
      { id: "m2-1", label: "[0]", value: { type: "number", value: 42 } },
      { id: "m2-2", label: "[1]", value: { type: "number", value: 7 } },
      { id: "m2-3", label: "[2]", value: { type: "number", value: 99 } },
    ],
  },
];

const entry: ShowcaseEntry = {
  title: "TreeView",
  group: "data",
  description: "A collapsible hierarchical list for nested data, with indent guide lines, controlled expand/collapse, arrow-key navigation, and typed value rendering.",
  demos: [
    {
      name: "Default & Condensed (depth-based expand)",
      render: () => (
        <div className="flex gap-6 max-w-2xl">
          <div className="flex-1 min-w-0 px-2">
            <TreeView data={sampleData} defaultExpandedDepth={1} />
          </div>
          <div className="w-px bg-border shrink-0" />
          <div className="flex-1 min-w-0 px-2">
            <TreeView data={sampleData} variant="condensed" defaultExpandedDepth={2} />
          </div>
        </div>
      ),
    },
    {
      name: "Controlled expand state",
      render: () => <ControlledTreeViewDemo />,
    },
    {
      name: "Leading icons (click a row, then use arrow keys)",
      render: () => (
        <div className="max-w-md px-2">
          <TreeView data={iconData} defaultExpandedDepth={2} />
        </div>
      ),
    },
    {
      name: "Messy nested payload (hover to trace depth guides)",
      render: () => (
        <div className="max-w-lg px-2">
          <TreeView data={messyPayload} defaultExpandedDepth={1} />
        </div>
      ),
    },
  ],
};
export default entry;
