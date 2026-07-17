import type { GraphNodeRow } from "../../graph-node";
import { portY } from "../../graph-node/grid";

export const NODE_WIDTH = 160;
export const PORT_HIT = 24;

export interface PortRef {
  nodeId: string;
  rowIndex: number;
  side: "left" | "right";
}

export type NodeState = "default" | "selected" | "muted";
export type EdgeState = "default" | "selected";

export interface EditorNode {
  id: string;
  x: number;
  y: number;
  header: string;
  rows: GraphNodeRow[];
  footer?: string;
  accent?: boolean;
  state?: NodeState;
}

export interface EditorEdge {
  id: string;
  from: PortRef;
  to: PortRef;
  state?: EdgeState;
}

export function getPortAnchor(
  node: { x: number; y: number },
  rowIndex: number,
  side: "left" | "right",
): { x: number; y: number } {
  return {
    x: side === "left" ? node.x : node.x + NODE_WIDTH,
    y: node.y + portY(rowIndex),
  };
}
