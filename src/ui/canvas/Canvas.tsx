import { forwardRef, useRef, useState, useCallback, useEffect } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { GRID } from "../graph-node/grid";

export interface CanvasProps extends HTMLAttributes<HTMLDivElement> {
  gridSize?: number;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  controls?: ReactNode;
  onBackgroundClick?: () => void;
  offset?: { x: number; y: number };
  zoom?: number;
  onOffsetChange?: (o: { x: number; y: number }) => void;
  onZoomChange?: (z: number) => void;
}

const btn =
  "inline-flex items-center justify-center size-7 rounded-ui-sm border border-border bg-bg text-xs text-fg hover:bg-secondary cursor-pointer";

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  ({ className, gridSize = GRID, initialZoom = 1, minZoom = 0.25, maxZoom = 3, zoomStep = 0.1, controls, children, style, onBackgroundClick, offset: controlledOffset, zoom: controlledZoom, onOffsetChange, onZoomChange, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [internalOffset, setInternalOffset] = useState({ x: 0, y: 0 });
    const [internalZoom, setInternalZoom] = useState(initialZoom);

    const isControlled = controlledOffset !== undefined;
    const offset = isControlled ? controlledOffset : internalOffset;
    const zoom = controlledZoom !== undefined ? controlledZoom : internalZoom;

    const setOffset = useCallback((o: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
      if (isControlled) {
        const next = typeof o === "function" ? o(offset) : o;
        onOffsetChange?.(next);
      } else {
        setInternalOffset(o);
      }
    }, [isControlled, offset, onOffsetChange]);

    const setZoom = useCallback((z: number | ((prev: number) => number)) => {
      if (onZoomChange) {
        const next = typeof z === "function" ? z(zoom) : z;
        onZoomChange(next);
      } else {
        setInternalZoom(z);
      }
    }, [zoom, onZoomChange]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      if (e.button !== 0) return;
      onBackgroundClick?.();
      const startX = e.clientX;
      const startY = e.clientY;
      const startOffset = { x: offset.x, y: offset.y };

      const onMove = (ev: MouseEvent) => {
        setOffset({
          x: startOffset.x + (ev.clientX - startX),
          y: startOffset.y + (ev.clientY - startY),
        });
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }, [offset, setOffset, onBackgroundClick]);

    const handleWheel = useCallback((e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setZoom((z) => {
        const next = e.deltaY < 0 ? z + zoomStep : z - zoomStep;
        const clamped = Math.min(maxZoom, Math.max(minZoom, Math.round(next * 10) / 10));
        const scale = clamped / z;
        setOffset((o) => ({ x: cx - (cx - o.x) * scale, y: cy - (cy - o.y) * scale }));
        return clamped;
      });
    }, [minZoom, maxZoom, zoomStep, setZoom, setOffset]);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      el.addEventListener("wheel", handleWheel, { passive: false });
      return () => el.removeEventListener("wheel", handleWheel);
    }, [handleWheel]);

    const zoomIn = () => setZoom((z) => Math.min(maxZoom, Math.round((z + zoomStep) * 10) / 10));
    const zoomOut = () => setZoom((z) => Math.max(minZoom, Math.round((z - zoomStep) * 10) / 10));
    const resetView = () => { setOffset({ x: 0, y: 0 }); setZoom(1); };

    const scaledGrid = gridSize * zoom;
    const bgPos = `${offset.x}px ${offset.y}px`;

    const mergedRef = useCallback((node: HTMLDivElement | null) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }, [ref]);

    return (
      <div
        ref={mergedRef}
        className={cn("relative overflow-hidden bg-bg select-none", className)}
        style={style}
        onMouseDown={handleMouseDown}
        {...props}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, var(--color-grid-dot) 1.5px, transparent 1.5px)",
            backgroundSize: `${scaledGrid}px ${scaledGrid}px`,
            backgroundPosition: bgPos,
          }}
        />
        <div
          className="absolute inset-0"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
        >
          {children}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-0.5 rounded-ui border border-border bg-bg p-0.5 shadow-card z-10" onMouseDown={(e) => e.stopPropagation()}>
          <button type="button" className={btn} onClick={zoomOut} title="Zoom out">−</button>
          <button type="button" className={cn(btn, "w-auto px-2 font-mono")} onClick={resetView} title="Reset view">
            {Math.round(zoom * 100)}%
          </button>
          <button type="button" className={btn} onClick={zoomIn} title="Zoom in">+</button>
          {controls && (
            <>
              <div className="w-px h-4 bg-border mx-0.5" />
              {controls}
            </>
          )}
        </div>
      </div>
    );
  },
);
Canvas.displayName = "Canvas";

export { Canvas };
