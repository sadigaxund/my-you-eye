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
  children,
}: {
  initialX: number;
  initialY: number;
  header: string;
  snap: boolean;
  children: string;
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
      <GraphNode x={pos.x} y={pos.y} header={header} variant={selected ? "selected" : "default"}>
        {children}
      </GraphNode>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Canvas",
  group: "canvas",
  demos: [
    {
      name: "Empty grid",
      render: () => (
        <Canvas className="h-48 w-full rounded-ui border border-border" />
      ),
    },
    {
      name: "With nodes (drag to pan, ctrl+scroll to zoom)",
      render: () => (
        <Canvas className="h-80 w-full rounded-ui border border-border">
          <GraphNode x={40} y={30} header="Extract" accent ports={[{ side: "right", state: "connected" }]}>API → Raw</GraphNode>
          <GraphNode x={280} y={30} header="Transform" variant="selected" accent ports={[{ side: "left", state: "connected" }, { side: "right", state: "connected" }]}>Clean + Map</GraphNode>
          <GraphNode x={520} y={30} header="Load" accent ports={[{ side: "left", state: "connected" }]}>DB → Warehouse</GraphNode>
        </Canvas>
      ),
    },
    {
      name: "Draggable nodes (snap to grid)",
      render: () => {
        const [snap, setSnap] = useState(true);
        return (
          <Canvas
            className="h-80 w-full rounded-ui border border-border"
            controls={<SnapToggle snap={snap} onToggle={() => setSnap((s) => !s)} />}
          >
            <DraggableNode initialX={40} initialY={30} header="Source" snap={snap}>Click to select, drag to move</DraggableNode>
            <DraggableNode initialX={300} initialY={30} header="Sink" snap={snap}>Toggle snap in bottom-right</DraggableNode>
          </Canvas>
        );
      },
    },
  ],
};
export default entry;
