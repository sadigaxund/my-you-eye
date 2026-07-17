import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { TreeView } from ".";
import type { TreeNode } from ".";

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
      <div className="max-h-64 overflow-auto px-2">
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
    children: [
      {
        id: "1-1",
        label: "0",
        value: { type: "text", value: "john@example.com" },
        children: [
          { id: "1-1-1", label: "name", value: { type: "text", value: "John" } },
          { id: "1-1-2", label: "active", value: { type: "boolean", value: true } },
          { id: "1-1-3", label: "role", value: { type: "badge", value: "Admin", badgeVariant: "primary" } },
        ],
      },
      {
        id: "1-2",
        label: "1",
        value: { type: "text", value: "jane@example.com" },
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
    children: [
      {
        id: "2-1",
        label: "limits",
        value: { type: "json", value: { maxConnections: 100, timeout: 30000 } },
      },
    ],
  },
  { id: "3", label: "version", value: { type: "text", value: "2.4.1" } },
  { id: "4", label: "null_field", value: { type: "null" } },
];

const entry: ShowcaseEntry = {
  title: "TreeView",
  group: "data",
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
  ],
};
export default entry;
