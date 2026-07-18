import { useState } from "react";
import type { ShowcaseEntry } from "../../../showcase/types";
import { Graph } from ".";
import { cn } from "../../../lib/cn";
import type { EditorNode, EditorEdge } from "./types";

const initialNodes: EditorNode[] = [
  {
    id: "extract",
    x: 90, y: 100,
    header: "extract_api",
    accent: true,
    footer: "15 cols · 2.1M rows",
    rows: [
      { label: "Source", value: "REST API", portRight: { side: "right", state: "connected" } },
      { label: "Status", value: "complete" },
      { label: "Duration", value: "45.2s" },
    ],
  },
  {
    id: "transform",
    x: 320, y: 120,
    header: "transform",
    accent: true,
    footer: "22 cols · 1.8M rows",
    rows: [
      { label: "Pipeline", value: "active", portLeft: { side: "left", state: "connected" }, portRight: { side: "right", state: "connected" } },
      { label: "Rows in", value: "2.1M" },
      { label: "Rows out", value: "1.8M" },
      { label: "Duration", value: "2m 14s" },
    ],
  },
  {
    id: "load",
    x: 550, y: 100,
    header: "load_warehouse",
    accent: true,
    footer: "22 cols · 1.8M rows",
    rows: [
      { label: "Target", value: "Snowflake", portLeft: { side: "left", state: "connected" } },
      { label: "Status", value: "complete" },
      { label: "Duration", value: "1m 03s" },
    ],
  },
];

const initialEdges: EditorEdge[] = [
  { id: "extract-transform", from: { nodeId: "extract", rowIndex: 0, side: "right" }, to: { nodeId: "transform", rowIndex: 0, side: "left" } },
  { id: "transform-load", from: { nodeId: "transform", rowIndex: 0, side: "right" }, to: { nodeId: "load", rowIndex: 0, side: "left" } },
];

function SnapToggle({ snap, onToggle }: { snap: boolean; onToggle: () => void }) {
  const btn = "inline-flex items-center justify-center size-7 rounded-ui-sm border border-border bg-bg text-xs text-fg hover:bg-secondary cursor-pointer";
  return (
    <button type="button" className={cn(btn, snap && "bg-primary text-primary-fg border-primary hover:bg-primary")} onClick={onToggle} title={snap ? "Snap to grid: ON" : "Snap to grid: OFF"}>
      <svg viewBox="0 0 14 14" className="size-3.5 fill-current">
        {snap ? (
          <path d="M2 2h3v3H2V2zm7 0h3v3H9V2zM2 9h3v3H2V9zm7 0h3v3H9V9z" />
        ) : (
          <path d="M3 2l9 9M11 2L2 11" stroke="currentColor" strokeWidth="1.5" fill="none" />
        )}
      </svg>
    </button>
  );
}

function Demo() {
  const [snap, setSnap] = useState(true);
  return (
    <Graph
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      snapToGrid={snap}
      controls={<SnapToggle snap={snap} onToggle={() => setSnap((s) => !s)} />}
    />
  );
}

const entry: ShowcaseEntry = {
  title: "Graph",
  group: "canvas",
  description: "A composed pattern combining Canvas, GraphNode, and Edge into a drag-and-drop pipeline editor.",
  demos: [{ name: "Pipeline editor (drag nodes, connect ports, delete selected)", render: () => <Demo /> }],
};
export default entry;
