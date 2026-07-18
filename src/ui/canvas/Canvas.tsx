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
    const childrenRef = useRef<HTMLDivElement>(null);
    const offsetRef = useRef({ x: 0, y: 0 });
    const zoomRef = useRef(initialZoom);
    const [internalOffset, setInternalOffset] = useState({ x: 0, y: 0 });
    const [internalZoom, setInternalZoom] = useState(initialZoom);

    const isControlled = controlledOffset !== undefined;
    const renderOffset = isControlled ? controlledOffset : internalOffset;
    const renderZoom = controlledZoom !== undefined ? controlledZoom : internalZoom;

    offsetRef.current = renderOffset;
    zoomRef.current = renderZoom;

    const setOffset = useCallback((o: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => {
      if (isControlled) {
        const next = typeof o === "function" ? o(renderOffset) : o;
        onOffsetChange?.(next);
      } else {
        setInternalOffset(o);
      }
    }, [isControlled, renderOffset, onOffsetChange]);

    const setZoom = useCallback((z: number | ((prev: number) => number)) => {
      if (onZoomChange) {
        const next = typeof z === "function" ? z(renderZoom) : z;
        onZoomChange(next);
      } else {
        setInternalZoom(z);
      }
    }, [renderZoom, onZoomChange]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      if (e.button !== 0) return;
      onBackgroundClick?.();
      const startX = e.clientX;
      const startY = e.clientY;
      const startOffset = { x: offsetRef.current.x, y: offsetRef.current.y };

      const onMove = (ev: MouseEvent) => {
        const newOffset = {
          x: startOffset.x + (ev.clientX - startX),
          y: startOffset.y + (ev.clientY - startY),
        };
        offsetRef.current = newOffset;
        if (childrenRef.current) {
          childrenRef.current.style.transform = `translate(${newOffset.x}px, ${newOffset.y}px) scale(${zoomRef.current})`;
        }
        onOffsetChange?.(newOffset);
        ev.preventDefault();
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        setInternalOffset(offsetRef.current);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    }, [onBackgroundClick, onOffsetChange]);

    const handleWheel = useCallback((e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const oldZoom = zoomRef.current;
      const next = e.deltaY < 0 ? oldZoom + zoomStep : oldZoom - zoomStep;
      const clamped = Math.min(maxZoom, Math.max(minZoom, Math.round(next * 10) / 10));
      const scale = clamped / oldZoom;
      const oldOffset = offsetRef.current;
      const newOffset = { x: cx - (cx - oldOffset.x) * scale, y: cy - (cy - oldOffset.y) * scale };
      offsetRef.current = newOffset;
      zoomRef.current = clamped;
      if (childrenRef.current) {
        childrenRef.current.style.transform = `translate(${newOffset.x}px, ${newOffset.y}px) scale(${clamped})`;
      }
      setInternalOffset(newOffset);
      setInternalZoom(clamped);
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
          ref={childrenRef}
          className="absolute inset-0"
          style={{
            transform: `translate(${renderOffset.x}px, ${renderOffset.y}px) scale(${renderZoom})`,
            transformOrigin: "0 0",
            // `willChange` belongs on this single transforming layer only —
            // never on the nodes/surfaces inside it. Promoting every node
            // individually multiplies GPU memory for no benefit; promoting
            // this one wrapper is what actually keeps drag/zoom smooth.
            willChange: "transform",
            // Token boundary (AGENTS.md §7 "Canvas surface boundary"):
            // surfaces INSIDE the transforming subtree never blur or
            // texture, regardless of the active theme. Every component
            // reads `var(--backdrop-blur)` / `var(--texture-opacity)`, so
            // overriding them here — rather than in each component — is
            // what makes this structural instead of a per-component patch.
            ["--backdrop-blur" as string]: "0px",
            ["--texture-opacity" as string]: "0",
          }}
        >
          <div
            className="absolute"
            style={{
              left: "-100vw", top: "-100vh", right: "-100vw", bottom: "-100vh",
              backgroundImage: "radial-gradient(circle, var(--color-grid-dot) 1.5px, transparent 1.5px)",
              backgroundSize: `${gridSize}px ${gridSize}px`,
              zIndex: "var(--z-canvas-grid)",
            }}
          />
          {children}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-0.5 rounded-ui border border-border bg-bg p-0.5 shadow-card" style={{ zIndex: "var(--z-canvas-controls)" }} onMouseDown={(e) => e.stopPropagation()}>
          <button type="button" className={btn} onClick={zoomOut} title="Zoom out">−</button>
          <button type="button" className={cn(btn, "w-auto px-2 font-mono")} onClick={resetView} title="Reset view">
            {Math.round(renderZoom * 100)}%
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
