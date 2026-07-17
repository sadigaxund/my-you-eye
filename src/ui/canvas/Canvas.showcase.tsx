import { useState, useCallback, useRef } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas } from ".";
import { GraphNode } from "../graph-node";
import { snap } from "./use-snap";

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
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const nodeStart = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    nodeStart.current = { x: pos.x, y: pos.y };
  }, [pos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPos({
      x: snap(nodeStart.current.x + dx),
      y: snap(nodeStart.current.y + dy),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: "grab" }}
    >
      <GraphNode x={pos.x} y={pos.y} header={header}>
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
          <DraggableNode initialX={40} initialY={30} header="Source">Drag me</DraggableNode>
          <DraggableNode initialX={300} initialY={30} header="Sink">Snaps to 16px grid</DraggableNode>
        </Canvas>
      ),
    },
  ],
};
export default entry;
