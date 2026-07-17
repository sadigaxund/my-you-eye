import { useState, useCallback, useRef } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas } from ".";
import { GraphNode } from "../graph-node";
import { snap as snapToGrid } from "./use-snap";

function DraggableNode({
  initialX,
  initialY,
  header,
  children,
}: {
  initialX: number;
  initialY: number;
  header: string;
  children: string;
}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [selected, setSelected] = useState(false);
  const [snap, setSnap] = useState(true);
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
      <div className="absolute -top-7 left-0 flex items-center gap-2 z-10">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setSnap((s) => !s); }}
          className={`text-[10px] px-1.5 py-0.5 rounded-sm border cursor-pointer ${
            snap ? "bg-primary text-primary-fg border-primary" : "bg-bg text-muted border-border"
          }`}
        >
          {snap ? "Snap: ON" : "Snap: OFF"}
        </button>
      </div>
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
      render: () => (
        <Canvas className="h-80 w-full rounded-ui border border-border">
          <DraggableNode initialX={40} initialY={30} header="Source">Click to select, drag to move</DraggableNode>
          <DraggableNode initialX={300} initialY={30} header="Sink">Snap/SnapOff toggle above</DraggableNode>
        </Canvas>
      ),
    },
  ],
};
export default entry;
