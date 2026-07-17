import { useState, useCallback, useRef } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas } from ".";
import { GraphNode } from "../graph-node";
import { cn } from "../../lib/cn";
import { snap as snapToGrid } from "./use-snap";

function SnapToggle({ snap, onToggle }: { snap: boolean; onToggle: () => void }) {
  const btn =
    "inline-flex items-center justify-center size-7 rounded-ui-sm border border-border bg-bg text-xs text-fg hover:bg-secondary cursor-pointer";
  return (
    <button
      type="button"
      className={cn(btn, snap && "bg-primary text-primary-fg border-primary hover:bg-primary")}
      onClick={onToggle}
      title={snap ? "Snap to grid: ON" : "Snap to grid: OFF"}
    >
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

function DraggableNode({
  initialX,
  initialY,
  header,
  snap,
  accent,
  variant,
  footer,
  rows,
}: {
  initialX: number;
  initialY: number;
  header: string;
  snap: boolean;
  accent?: boolean;
  variant?: "default" | "selected" | "muted";
  footer?: string;
  rows?: { label: string; value: string; portLeft?: { side: "left"; state?: "default" | "connected" | "highlighted" }; portRight?: { side: "right"; state?: "default" | "connected" | "highlighted" } }[];
}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [selected, setSelected] = useState(false);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const nodeStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(true);
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    nodeStart.current = { x: pos.x, y: pos.y };
  }, [pos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    let newX = nodeStart.current.x + dx;
    let newY = nodeStart.current.y + dy;
    if (snap) {
      newX = snapToGrid(newX);
      newY = snapToGrid(newY);
    }
    setPos({ x: newX, y: newY });
  }, [snap]);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      className="relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: dragging.current ? "grabbing" : "grab" }}
    >
      <GraphNode
        x={pos.x} y={pos.y}
        header={header}
        variant={selected ? "selected" : variant}
        accent={accent}
        footer={footer}
        rows={rows}
      />
    </div>
  );
}

function CanvasDemo() {
  const [snap, setSnap] = useState(true);
  return (
    <Canvas
      className="h-96 w-full rounded-ui border border-border"
      controls={<SnapToggle snap={snap} onToggle={() => setSnap((s) => !s)} />}
    >
      <DraggableNode
        initialX={30} initialY={20}
        header="extract_api"
        accent
        snap={snap}
        footer="15 cols · 2.1M rows"
        rows={[
          { label: "Source", value: "REST API", portRight: { side: "right", state: "connected" } },
          { label: "Status", value: "complete" },
          { label: "Duration", value: "45.2s" },
        ]}
      />
      <DraggableNode
        initialX={260} initialY={40}
        header="transform"
        variant="selected"
        accent
        snap={snap}
        footer="22 cols · 1.8M rows"
        rows={[
          { label: "Pipeline", value: "active", portLeft: { side: "left", state: "connected" }, portRight: { side: "right", state: "connected" } },
          { label: "Rows in", value: "2.1M" },
          { label: "Rows out", value: "1.8M" },
          { label: "Duration", value: "2m 14s" },
        ]}
      />
      <DraggableNode
        initialX={490} initialY={20}
        header="load_warehouse"
        accent
        snap={snap}
        footer="22 cols · 1.8M rows"
        rows={[
          { label: "Target", value: "Snowflake", portLeft: { side: "left", state: "connected" } },
          { label: "Status", value: "complete" },
          { label: "Duration", value: "1m 03s" },
        ]}
      />
    </Canvas>
  );
}

const entry: ShowcaseEntry = {
  title: "Canvas",
  group: "canvas",
  demos: [
    {
      name: "Pipeline canvas (drag nodes, toggle snap, pan/zoom)",
      render: () => <CanvasDemo />,
    },
  ],
};
export default entry;
