import { useState, useCallback, useRef, useEffect } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas } from ".";
import { GraphNode, type GraphNodeRow } from "../graph-node";
import { cn } from "../../lib/cn";
import { snap as snapToGrid } from "./use-snap";
import { GRID, HEADER, ROW } from "../graph-node/grid";
import { generatePath } from "../connection-line";

const NODE_WIDTH = 160;
const PORT_HIT = 24;

interface PortRef { nodeId: string; rowIndex: number; side: "left" | "right"; }

function portCenter(ref: PortRef, nodes: Record<string, { x: number; y: number }>) {
  const n = nodes[ref.nodeId];
  if (!n) return null;
  return {
    x: ref.side === "left" ? n.x : n.x + NODE_WIDTH,
    y: n.y + (HEADER + ref.rowIndex * ROW + ROW / 2) * GRID,
  };
}

function SnapToggle({ snap, onToggle }: { snap: boolean; onToggle: () => void }) {
  const btn = "inline-flex items-center justify-center size-7 rounded-ui-sm border border-border bg-bg text-xs text-fg hover:bg-secondary cursor-pointer";
  return (
    <button type="button" className={cn(btn, snap && "bg-primary text-primary-fg border-primary hover:bg-primary")} onClick={onToggle} title={snap ? "Snap to grid: ON" : "Snap to grid: OFF"}>
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

interface DragCallbacks {
  onPortDragStart: (p: { from: PortRef; mousePos: { x: number; y: number } }) => void;
  onPortDragMove: (p: { canvasX: number; canvasY: number }) => void;
  onPortDragEnd: (p: { target: PortRef | null }) => void;
}

function DraggableNode({
  id, initialX, initialY, header, snap, accent, variant, footer, selectedId, onSelect,
  onNodeMove, dragCallbacks, rows,
}: {
  id: string; initialX: number; initialY: number; header: string; snap: boolean;
  accent?: boolean; variant?: "default" | "selected" | "muted"; footer?: string;
  selectedId: string | null; onSelect: (id: string | null) => void;
  onNodeMove: (id: string, x: number, y: number) => void; dragCallbacks: DragCallbacks;
  rows?: GraphNodeRow[];
}) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const dragging = useRef(false);
  const ds = useRef({ x: 0, y: 0 });
  const ns = useRef({ x: 0, y: 0 });
  const portDrag = useRef(false);
  const cb = useRef(dragCallbacks);
  cb.current = dragCallbacks;

  useEffect(() => { onNodeMove(id, pos.x, pos.y); }, [pos, id, onNodeMove]);

  const onDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); onSelect(id);
    dragging.current = true; ds.current = { x: e.clientX, y: e.clientY }; ns.current = { x: pos.x, y: pos.y };
  }, [pos, id, onSelect]);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!dragging.current) return;
    let x = ns.current.x + e.clientX - ds.current.x;
    let y = ns.current.y + e.clientY - ds.current.y;
    if (snap) { x = snapToGrid(x); y = snapToGrid(y); }
    setPos({ x, y });
  }, [snap]);

  const onUp = useCallback(() => { dragging.current = false; }, []);

  const stopProp = useCallback((e: React.MouseEvent) => e.stopPropagation(), []);

  const pDown = useCallback((e: React.PointerEvent, ri: number, side: "left" | "right") => {
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    portDrag.current = true;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const s = r.width / PORT_HIT;
    const pc = portCenter({ nodeId: id, rowIndex: ri, side }, { [id]: pos });
    if (!pc) return;
    cb.current.onPortDragStart({ from: { nodeId: id, rowIndex: ri, side }, mousePos: { x: pc.x + (e.clientX - r.left - r.width / 2) / s, y: pc.y + (e.clientY - r.top - r.height / 2) / s } });
  }, [id, pos]);

  const pMove = useCallback((e: React.PointerEvent, ri: number, side: "left" | "right") => {
    if (!portDrag.current) return;
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const s = r.width / PORT_HIT;
    const pc = portCenter({ nodeId: id, rowIndex: ri, side }, { [id]: pos });
    if (!pc) return;
    cb.current.onPortDragMove({ canvasX: pc.x + (e.clientX - r.left - r.width / 2) / s, canvasY: pc.y + (e.clientY - r.top - r.height / 2) / s });
  }, [id, pos]);

  const pUp = useCallback((e: React.PointerEvent) => {
    if (!portDrag.current) return;
    portDrag.current = false;
    const attr = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-port]")?.getAttribute("data-port");
    if (attr) { const [nid, ri, sd] = attr.split("-"); cb.current.onPortDragEnd({ target: { nodeId: nid, rowIndex: parseInt(ri), side: sd as "left" | "right" } }); }
    else { cb.current.onPortDragEnd({ target: null }); }
  }, []);

  const portY = (ri: number) => pos.y + (HEADER + ri * ROW + ROW / 2) * GRID - PORT_HIT / 2;
  const sel = selectedId === id;

  return (
    <div className="relative" onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      style={{ cursor: dragging.current ? "grabbing" : "grab" }}>
      <GraphNode x={pos.x} y={pos.y} header={header} variant={sel ? "selected" : variant} accent={accent} footer={footer} rows={rows} />
      {rows?.flatMap((row, i) => (["left", "right"] as const).filter(s => (s === "left" ? row.portLeft : row.portRight)).map(s => (
        <div key={`${i}-${s}`} data-port={`${id}-${i}-${s}`}
          className="absolute z-20 rounded-full bg-transparent"
          style={{ left: pos.x + (s === "left" ? -PORT_HIT / 2 : NODE_WIDTH - PORT_HIT / 2), top: portY(i), width: PORT_HIT, height: PORT_HIT, cursor: "crosshair" }}
          onPointerDown={(e) => pDown(e, i, s)} onPointerMove={(e) => pMove(e, i, s)} onPointerUp={pUp}
          onMouseDown={stopProp} />
      )))}
    </div>
  );
}

function CanvasDemo() {
  const [snap, setSnap] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [connections, setConnections] = useState<Array<{ from: PortRef; to: PortRef }>>([]);
  const [pending, setPending] = useState<{ from: PortRef; fromPos: { x: number; y: number }; mousePos: { x: number; y: number } } | null>(null);
  const [nodes, setNodes] = useState<Record<string, { x: number; y: number }>>({});

  const onNodeMove = useCallback((id: string, x: number, y: number) => {
    setNodes(p => ({ ...p, [id]: { x, y } }));
  }, []);

  const start = useCallback(({ from, mousePos }: { from: PortRef; mousePos: { x: number; y: number } }) => {
    setPending(null);
    setNodes(p => {
      const fp = portCenter(from, p);
      if (fp) setPending({ from, fromPos: fp, mousePos });
      return p;
    });
  }, []);

  const move = useCallback(({ canvasX, canvasY }: { canvasX: number; canvasY: number }) => {
    setPending(p => p ? { ...p, mousePos: { x: canvasX, y: canvasY } } : null);
  }, []);

  const end = useCallback(({ target }: { target: PortRef | null }) => {
    setPending(p => {
      if (!p) return null;
      if (target && target.nodeId !== p.from.nodeId && target.side !== p.from.side)
        setConnections(c => [...c, { from: p.from, to: target }]);
      return null;
    });
  }, []);

  const deleteConn = useCallback((i: number) => {
    setConnections(c => c.filter((_, idx) => idx !== i));
  }, []);

  const dc: DragCallbacks = { onPortDragStart: start, onPortDragMove: move, onPortDragEnd: end };

  return (
    <Canvas className="h-96 w-full rounded-ui border border-border"
      controls={<SnapToggle snap={snap} onToggle={() => setSnap(s => !s)} />}
      onBackgroundClick={() => setSelectedId(null)}>
      <DraggableNode id="extract" initialX={30} initialY={20} header="extract_api" accent snap={snap}
        selectedId={selectedId} onSelect={setSelectedId} onNodeMove={onNodeMove} dragCallbacks={dc}
        footer="15 cols · 2.1M rows"
        rows={[
          { label: "Source", value: "REST API", portRight: { side: "right" } },
          { label: "Status", value: "complete" },
          { label: "Duration", value: "45.2s" },
        ]} />
      <DraggableNode id="transform" initialX={260} initialY={40} header="transform" accent snap={snap}
        selectedId={selectedId} onSelect={setSelectedId} onNodeMove={onNodeMove} dragCallbacks={dc}
        footer="22 cols · 1.8M rows"
        rows={[
          { label: "Pipeline", value: "active", portLeft: { side: "left" }, portRight: { side: "right" } },
          { label: "Rows in", value: "2.1M" },
          { label: "Rows out", value: "1.8M" },
          { label: "Duration", value: "2m 14s" },
        ]} />
      <DraggableNode id="load" initialX={490} initialY={20} header="load_warehouse" accent snap={snap}
        selectedId={selectedId} onSelect={setSelectedId} onNodeMove={onNodeMove} dragCallbacks={dc}
        footer="22 cols · 1.8M rows"
        rows={[
          { label: "Target", value: "Snowflake", portLeft: { side: "left" } },
          { label: "Status", value: "complete" },
          { label: "Duration", value: "1m 03s" },
        ]} />
      <svg className="absolute inset-0" style={{ overflow: "visible", width: "100%", height: "100%" }}>
        {connections.map((c, i) => {
          const f = portCenter(c.from, nodes);
          const t = portCenter(c.to, nodes);
          if (!f || !t) return null;
          return (
            <g key={i}>
              <path d={generatePath(f, t, "bezier")} fill="none" stroke="transparent" strokeWidth="12"
                className="cursor-pointer" style={{ pointerEvents: "auto" }}
                onContextMenu={(e) => { e.preventDefault(); deleteConn(i); }} />
              <path d={generatePath(f, t, "bezier")} className="fill-none stroke-primary stroke-[2px] pointer-events-none" />
            </g>
          );
        })}
        {pending && <path d={generatePath(pending.fromPos, pending.mousePos, "bezier")}
          className="fill-none stroke-muted stroke-[2px] opacity-60" style={{ strokeDasharray: "6 3" }} />}
      </svg>
    </Canvas>
  );
}

const entry: ShowcaseEntry = {
  title: "Canvas",
  group: "canvas",
  demos: [{ name: "Pipeline canvas (drag nodes, toggle snap, pan/zoom)", render: () => <CanvasDemo /> }],
};
export default entry;
