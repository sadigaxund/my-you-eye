import { forwardRef, useRef, useState, useCallback, useEffect } from "react";
import type { ReactNode, HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface CanvasProps extends HTMLAttributes<HTMLDivElement> {
  gridSize?: number;
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  controls?: ReactNode;
  onBackgroundClick?: () => void;
}

const btn =
  "inline-flex items-center justify-center size-7 rounded-ui-sm border border-border bg-bg text-xs text-fg hover:bg-secondary cursor-pointer";

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  ({ className, gridSize = 20, initialZoom = 1, minZoom = 0.25, maxZoom = 3, zoomStep = 0.1, controls, children, style, onBackgroundClick, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(initialZoom);
    const dragging = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const dragOffset = useRef({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      if (e.button !== 0) return;
      onBackgroundClick?.();
      dragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      dragOffset.current = { x: offset.x, y: offset.y };
    }, [offset, onBackgroundClick]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (!dragging.current) return;
      setOffset({
        x: dragOffset.current.x + (e.clientX - dragStart.current.x),
        y: dragOffset.current.y + (e.clientY - dragStart.current.y),
      });
    }, []);

    const handleMouseUp = useCallback(() => {
      dragging.current = false;
    }, []);

    const handleWheel = useCallback((e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => {
        const next = e.deltaY < 0 ? z + zoomStep : z - zoomStep;
        return Math.min(maxZoom, Math.max(minZoom, Math.round(next * 10) / 10));
      });
    }, [minZoom, maxZoom, zoomStep]);

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

    return (
      <div
        ref={(node) => {
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={cn("relative overflow-hidden bg-bg select-none", className)}
        style={style}
        {...props}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle,color-mix(in oklch,var(--color-border) 60%,var(--color-muted))_2px,transparent_2px)",
            backgroundSize: `${scaledGrid}px ${scaledGrid}px`,
            backgroundPosition: bgPos,
          }}
        />
        <div
          className="absolute inset-0"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, transformOrigin: "0 0" }}
        >
          {children}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-0.5 rounded-ui border border-border bg-bg p-0.5 shadow-card z-10">
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
