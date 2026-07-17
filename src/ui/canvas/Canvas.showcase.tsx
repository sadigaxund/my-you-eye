import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas, Edge } from ".";
import { Orchestrator } from "../patterns/orchestrator";
import type { EditorNode } from "../patterns/orchestrator";

const initialNodes: EditorNode[] = [
  {
    id: "extract", x: 30, y: 20, header: "extract_api", accent: true, footer: "15 cols · 2.1M rows",
    rows: [
      { label: "Source", value: "REST API", portRight: { side: "right" } },
      { label: "Status", value: "complete" },
      { label: "Duration", value: "45.2s" },
    ],
  },
  {
    id: "transform", x: 260, y: 40, header: "transform", accent: true, footer: "22 cols · 1.8M rows",
    rows: [
      { label: "Pipeline", value: "active", portLeft: { side: "left" }, portRight: { side: "right" } },
      { label: "Rows in", value: "2.1M" },
      { label: "Rows out", value: "1.8M" },
      { label: "Duration", value: "2m 14s" },
    ],
  },
  {
    id: "load", x: 490, y: 20, header: "load_warehouse", accent: true, footer: "22 cols · 1.8M rows",
    rows: [
      { label: "Target", value: "Snowflake", portLeft: { side: "left" } },
      { label: "Status", value: "complete" },
      { label: "Duration", value: "1m 03s" },
    ],
  },
];

const entry: ShowcaseEntry = {
  title: "Canvas",
  group: "canvas",
  demos: [
    {
      name: "Empty grid",
      render: () => <Canvas className="h-64 w-full rounded-ui border border-border" />,
    },
    {
      name: "Pipeline editor",
      render: () => <Orchestrator initialNodes={initialNodes} snapToGrid />,
    },
    {
      name: "Edge states",
      render: () => (
        <div className="flex flex-col gap-6">
          {(["default", "selected", "animated"] as const).map((state) => (
            <div key={state} className="relative" style={{ width: 300, height: 60 }}>
              <svg width={300} height={60} className="overflow-visible">
                <Edge from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} state={state} />
              </svg>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">{state}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Edge clickable hit area",
      render: () => (
        <div className="relative" style={{ width: 300, height: 60 }}>
          <svg width={300} height={60} className="overflow-visible">
            <Edge from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }}
              onClick={() => alert("Edge clicked")} onContextMenu={(e) => { e.preventDefault(); alert("Edge context menu"); }} />
          </svg>
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">Click or right-click the path</span>
        </div>
      ),
    },
  ],
};
export default entry;
