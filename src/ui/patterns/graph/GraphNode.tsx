import { useCallback } from "react";
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
  const onDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
    onDragStart(node.id, e.clientX, e.clientY, node.x, node.y);
  }, [node.id, node.x, node.y, onSelect, onDragStart]);

  return (
    <div className="absolute relative" style={{ left: node.x, top: node.y, width: NODE_WIDTH }} onMouseDown={onDown}>
      <GraphNode
        x={0} y={0}
        header={node.header}
        variant={isSelected ? "selected" : node.state ?? "default"}
        accent={node.accent}
        footer={node.footer}
        rows={node.rows}
        className="max-w-[160px]"
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
