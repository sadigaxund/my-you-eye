import { useReducer, useRef, useCallback, useEffect } from "react";
import type { FC, ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Canvas } from "../../canvas";
import { Edge } from "../../canvas";
import { snap } from "../../graph-node/grid";
import { generatePath } from "../../connection-line";
import { getPortAnchor } from "./types";
import type { PortRef, EditorNode, EditorEdge } from "./types";
import { OrchestratorNode } from "./OrchestratorNode";

export type { PortRef, EditorNode, EditorEdge };

export interface OrchestratorProps {
  initialNodes: EditorNode[];
  initialEdges?: EditorEdge[];
  snapToGrid?: boolean;
  className?: string;
  controls?: ReactNode;
  onChange?: (state: { nodes: EditorNode[]; edges: EditorEdge[] }) => void;
}

interface ConnectingState {
  from: PortRef;
  fromPos: { x: number; y: number };
  cursorWorld: { x: number; y: number };
}

interface InternalState {
  nodes: EditorNode[];
  edges: EditorEdge[];
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  connecting: ConnectingState | null;
  offset: { x: number; y: number };
  zoom: number;
}

type Action =
  | { type: "MOVE_NODE"; id: string; x: number; y: number }
  | { type: "SELECT_NODE"; id: string }
  | { type: "SELECT_EDGE"; id: string }
  | { type: "DESELECT_ALL" }
  | { type: "START_CONNECTING"; from: PortRef; fromPos: { x: number; y: number }; cursorWorld: { x: number; y: number } }
  | { type: "MOVE_CONNECTING"; cursorWorld: { x: number; y: number } }
  | { type: "END_CONNECTING"; to: PortRef | null }
  | { type: "DELETE_SELECTED" }
  | { type: "SET_OFFSET"; offset: { x: number; y: number } }
  | { type: "SET_ZOOM"; zoom: number };

function orchestratorReducer(state: InternalState, action: Action): InternalState {
  switch (action.type) {
    case "MOVE_NODE":
      return {
        ...state,
        nodes: state.nodes.map((n) => (n.id === action.id ? { ...n, x: action.x, y: action.y } : n)),
      };
    case "SELECT_NODE":
      return { ...state, selectedNodeIds: [action.id], selectedEdgeIds: [] };
    case "SELECT_EDGE":
      return { ...state, selectedEdgeIds: [action.id], selectedNodeIds: [] };
    case "DESELECT_ALL":
      return { ...state, selectedNodeIds: [], selectedEdgeIds: [] };
    case "START_CONNECTING":
      return { ...state, connecting: { from: action.from, fromPos: action.fromPos, cursorWorld: action.cursorWorld } };
    case "MOVE_CONNECTING":
      return state.connecting ? { ...state, connecting: { ...state.connecting, cursorWorld: action.cursorWorld } } : state;
    case "END_CONNECTING": {
      if (!state.connecting) return state;
      const from = state.connecting.from;
      const to = action.to;
      if (to && to.nodeId !== from.nodeId && to.side !== from.side) {
        const exists = state.edges.some(
          (e) => e.from.nodeId === from.nodeId && e.from.rowIndex === from.rowIndex && e.to.nodeId === to.nodeId && e.to.rowIndex === to.rowIndex,
        );
        if (!exists) {
          return {
            ...state,
            edges: [...state.edges, { id: `${from.nodeId}-${from.rowIndex}-to-${to.nodeId}-${to.rowIndex}`, from, to }],
            connecting: null,
          };
        }
      }
      return { ...state, connecting: null };
    }
    case "DELETE_SELECTED": {
      const nodeIds = new Set(state.selectedNodeIds);
      const edgeIds = new Set(state.selectedEdgeIds);
      return {
        ...state,
        nodes: state.nodes.filter((n) => !nodeIds.has(n.id)),
        edges: state.edges.filter((e) => !nodeIds.has(e.from.nodeId) && !nodeIds.has(e.to.nodeId) && !edgeIds.has(e.id)),
        selectedNodeIds: [],
        selectedEdgeIds: [],
      };
    }
    case "SET_OFFSET":
      return { ...state, offset: action.offset };
    case "SET_ZOOM":
      return { ...state, zoom: action.zoom };
  }
}

const Orchestrator: FC<OrchestratorProps> = ({
  initialNodes, initialEdges = [], snapToGrid: snapToGridProp = false, className, controls, onChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [state, dispatch] = useReducer(orchestratorReducer, {
    nodes: initialNodes, edges: initialEdges, selectedNodeIds: [], selectedEdgeIds: [], connecting: null,
    offset: { x: 0, y: 0 }, zoom: 1,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const snapToGrid = useRef(snapToGridProp);
  snapToGrid.current = snapToGridProp;

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    onChangeRef.current?.({ nodes: state.nodes, edges: state.edges });
  });

  const screenToWorld = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const s = stateRef.current;
    return {
      x: (clientX - rect.left - s.offset.x) / s.zoom,
      y: (clientY - rect.top - s.offset.y) / s.zoom,
    };
  }, []);

  const handleDragStart = useCallback((id: string, clientX: number, clientY: number, nodeX: number, nodeY: number) => {
    const startX = clientX, startY = clientY;
    const startNodeX = nodeX, startNodeY = nodeY;

    const onMove = (e: globalThis.MouseEvent) => {
      const z = stateRef.current.zoom;
      dispatch({ type: "MOVE_NODE", id, x: startNodeX + (e.clientX - startX) / z, y: startNodeY + (e.clientY - startY) / z });
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      if (snapToGrid.current) {
        const n = stateRef.current.nodes.find((x) => x.id === id);
        if (n) dispatch({ type: "MOVE_NODE", id, x: snap(n.x), y: snap(n.y) });
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, []);

  const handlePortEvent = useCallback((type: "start" | "move" | "end", portRef: PortRef, e: PointerEvent) => {
    if (type === "start") {
      const node = stateRef.current.nodes.find((n) => n.id === portRef.nodeId);
      if (!node) return;
      const fromPos = getPortAnchor(node, portRef.rowIndex, portRef.side);
      dispatch({ type: "START_CONNECTING", from: portRef, fromPos, cursorWorld: screenToWorld(e.clientX, e.clientY) });
    } else if (type === "move") {
      dispatch({ type: "MOVE_CONNECTING", cursorWorld: screenToWorld(e.clientX, e.clientY) });
    } else {
      const target = (() => {
        const el = document.elementFromPoint(e.clientX, e.clientY);
        const attr = el?.closest<HTMLElement>("[data-port]")?.getAttribute("data-port");
        if (!attr) return null;
        const [nid, ri, sd] = attr.split("-");
        return { nodeId: nid, rowIndex: parseInt(ri), side: sd as "left" | "right" };
      })();
      dispatch({ type: "END_CONNECTING", to: target });
    }
  }, [screenToWorld]);

  useEffect(() => {
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && (stateRef.current.selectedNodeIds.length > 0 || stateRef.current.selectedEdgeIds.length > 0)) {
        dispatch({ type: "DELETE_SELECTED" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleEdgeClick = useCallback((edgeId: string) => {
    dispatch({ type: "SELECT_EDGE", id: edgeId });
  }, []);

  const { nodes, edges, selectedNodeIds, selectedEdgeIds, connecting, offset, zoom } = state;

  return (
    <Canvas
      ref={containerRef}
      className={cn("h-96 w-full rounded-ui border border-border", className)}
      offset={offset}
      zoom={zoom}
      onOffsetChange={(o) => dispatch({ type: "SET_OFFSET", offset: o })}
      onZoomChange={(z) => dispatch({ type: "SET_ZOOM", zoom: z })}
      onBackgroundClick={() => dispatch({ type: "DESELECT_ALL" })}
      controls={controls}
    >
      <svg className="absolute inset-0" style={{ overflow: "visible", width: "100%", height: "100%", pointerEvents: "none" }}>
        {edges.map((edge) => {
          const fn = nodes.find((n) => n.id === edge.from.nodeId);
          const tn = nodes.find((n) => n.id === edge.to.nodeId);
          if (!fn || !tn) return null;
          const accent = fn.accent || tn.accent;
          return (
            <Edge
              key={edge.id}
              from={getPortAnchor(fn, edge.from.rowIndex, edge.from.side)}
              to={getPortAnchor(tn, edge.to.rowIndex, edge.to.side)}
              state={selectedEdgeIds.includes(edge.id) ? "selected" : (edge.state ?? "default")}
              className={accent && !selectedEdgeIds.includes(edge.id) ? "stroke-primary" : undefined}
              onClick={() => handleEdgeClick(edge.id)}
            />
          );
        })}
        {connecting && (
          <path d={generatePath(connecting.fromPos, connecting.cursorWorld, "bezier")}
            className="fill-none stroke-muted stroke-[2px] opacity-60" style={{ strokeDasharray: "6 3" }} />
        )}
      </svg>
      {nodes.map((node) => (
        <OrchestratorNode
          key={node.id} node={node}
          isSelected={selectedNodeIds.includes(node.id)}
          onSelect={(id) => dispatch({ type: "SELECT_NODE", id })}
          onDragStart={handleDragStart}
          onPortEvent={handlePortEvent}
        />
      ))}
    </Canvas>
  );
};

export { Orchestrator };
