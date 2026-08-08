import { useCallback } from "react";
import type { MouseEvent } from "react";
import { GraphNode } from "../../graph-node";
import type { EditorNode, PortRef } from "./types";
import { PortHitZone } from "./PortHitZone";
import { NODE_WIDTH } from "./types";

export function GraphNodeRenderer({
  node, isSelected, onSelect, onDragStart, onPortEvent,
}: {
  node: EditorNode; isSelected: boolean;
  onSelect: (id: string) => void;
  onDragStart: (id: string, clientX: number, clientY: number, nodeX: number, nodeY: number) => void;
  onPortEvent: (type: "start" | "move" | "end", portRef: PortRef, e: PointerEvent) => void;
}) {
  const onDown = useCallback((e: MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
    onDragStart(node.id, e.clientX, e.clientY, node.x, node.y);
  }, [node.id, node.x, node.y, onSelect, onDragStart]);

  return (
    <div className="absolute" style={{ left: node.x, top: node.y, width: NODE_WIDTH }} onMouseDown={onDown}>
      {/* Width comes from NODE_WIDTH alone (types.ts) — the wrapper div above
          sets it via inline style, and GraphNode gets the same value via
          inline style below, instead of a second, independently-drifting
          Tailwind class (the old `max-w-40` was a rem-based 160px that could
          disagree with NODE_WIDTH's raw px 160 under a themed --scale). See
          TODO.md A2 "GraphNode two sources of truth for node width". */}
      <GraphNode
        x={0} y={0}
        header={node.header}
        variant={isSelected ? "selected" : node.state ?? "default"}
        accent={node.accent}
        footer={node.footer}
        rows={node.rows}
        style={{ width: NODE_WIDTH }}
      />
      {node.rows.flatMap((row, i) =>
        (["left", "right"] as const)
          .filter((s) => (s === "left" ? row.portLeft : row.portRight))
          .map((s) => (
            <PortHitZone key={`${i}-${s}`} nodeId={node.id} rowIndex={i} side={s} onPortEvent={onPortEvent} />
          )),
      )}
    </div>
  );
}
