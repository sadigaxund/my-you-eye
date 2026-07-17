import type { ShowcaseEntry } from "../../showcase/types";
import { TreeView } from ".";
import type { TreeNode } from ".";

const sampleData: TreeNode[] = [
  {
    id: "1",
    label: "users",
    defaultCollapsed: false,
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
      name: "Nested data tree",
      render: () => (
        <div className="max-w-md">
          <TreeView data={sampleData} />
        </div>
      ),
    },
    {
      name: "Condensed variant",
      render: () => (
        <div className="max-w-md">
          <TreeView data={sampleData} variant="condensed" />
        </div>
      ),
    },
  ],
};
export default entry;
