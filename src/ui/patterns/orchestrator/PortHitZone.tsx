import { useCallback, useRef } from "react";
import type { PortRef } from "./types";
import { NODE_WIDTH, PORT_HIT } from "./types";
import { portY } from "../../graph-node/grid";

export function PortHitZone({
  nodeId, rowIndex, side, onPortEvent,
}: {
  nodeId: string; rowIndex: number; side: "left" | "right";
  onPortEvent: (type: "start" | "move" | "end", portRef: PortRef, e: PointerEvent) => void;
}) {
  const elRef = useRef<HTMLDivElement>(null);

  const down = useCallback((e: React.PointerEvent) => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onPortEvent("start", { nodeId, rowIndex, side }, e.nativeEvent);
  }, [nodeId, rowIndex, side, onPortEvent]);

  const move = useCallback((e: React.PointerEvent) => {
    onPortEvent("move", { nodeId, rowIndex, side }, e.nativeEvent);
  }, [nodeId, rowIndex, side, onPortEvent]);

  const up = useCallback((e: React.PointerEvent) => {
    onPortEvent("end", { nodeId, rowIndex, side }, e.nativeEvent);
  }, [nodeId, rowIndex, side, onPortEvent]);

  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  return (
    <div
      ref={elRef}
      data-port={`${nodeId}-${rowIndex}-${side}`}
      className="absolute z-20 rounded-full bg-transparent"
      style={{
        left: side === "left" ? -PORT_HIT / 2 : NODE_WIDTH - PORT_HIT / 2,
        top: portY(rowIndex) - PORT_HIT / 2,
        width: PORT_HIT, height: PORT_HIT,
        cursor: "crosshair",
      }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onMouseDown={stopProp}
    />
  );
}
