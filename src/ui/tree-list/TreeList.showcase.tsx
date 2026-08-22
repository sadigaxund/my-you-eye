import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { TreeList } from ".";
import type { TreeListNode } from ".";

const vault: TreeListNode[] = [
  {
    id: "docs",
    label: "docs",
    icon: (
      <svg viewBox="0 0 16 16" className="fill-none stroke-current">
        <path d="M2 4a1 1 0 011-1h3l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" strokeWidth="1.3" />
      </svg>
    ),
    children: [
      { id: "arch", label: "architecture.md", cells: { size: 18432, kind: "markdown", changed: "2026-08-20T10:00:00Z" } },
      { id: "guide", label: "getting-started.md", cells: { size: 9216, kind: "markdown", changed: "2026-08-18T09:30:00Z" } },
    ],
  },
  {
    id: "src",
    label: "src",
    icon: (
      <svg viewBox="0 0 16 16" className="fill-none stroke-current">
        <path d="M2 4a1 1 0 011-1h3l1.5 1.5H13a1 1 0 011 1V12a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" strokeWidth="1.3" />
      </svg>
    ),
    children: [
      { id: "main", label: "main.tsx", cells: { size: 4096, kind: "typescript", changed: "2026-08-21T16:45:00Z" } },
      { id: "styles", label: "styles.css", cells: { size: 2048, kind: "css", changed: "2026-08-14T12:00:00Z" } },
    ],
  },
  { id: "readme", label: "README.md", cells: { size: 512, kind: "markdown", changed: "2026-08-10T08:00:00Z" } },
];

function VaultDemo() {
  const [selectedId, setSelectedId] = useState<string | undefined>("arch");
  return (
    <div className="mx-auto max-w-xl">
      <TreeList
        nodes={vault}
        selectedId={selectedId}
        onSelect={(n) => setSelectedId(n.id)}
        defaultExpandedDepth={2}
        columns={[
          { key: "size", header: "Size", type: "bytes", align: "right" },
          { key: "kind", header: "Kind", type: "text" },
          { key: "changed", header: "Modified", type: "datetime-tz", align: "right" },
        ]}
      />
      <p className="mt-2 text-xs text-muted text-center">Selected: {selectedId ?? "none"}</p>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "TreeList",
  group: "data",
  description:
    "The tree×table hybrid — rows expand like a tree while carrying typed columns rendered through CellType. Neither DataTable (flat) nor TreeView (label-only) covers this shape.",
  demos: [
    {
      name: "Vault browser",
      description:
        "Expansion follows TreeView's model (controlled expandedIds/onToggle or uncontrolled); cells reuse DataTable's typed-column contract.",
      render: () => <VaultDemo />,
    },
  ],
};
export default entry;
