import { cn } from "../../lib/cn";

export type DockEdge = "left" | "right" | "top" | "bottom" | "center";

export interface DockOverlayProps {
  edge: DockEdge;
  className?: string;
}

// Edge-aware drop-zone preview for drag-to-dock interactions (#8): a
// translucent primary-tinted rect over whichever edge (or center = merge)
// a dragged item hovers. pointer-events-none — purely visual; the parent
// must be positioned.
const DOCK_RECT: Record<DockEdge, string> = {
  left: "inset-y-1 left-1 w-1/2",
  right: "inset-y-1 right-1 w-1/2",
  top: "inset-x-1 top-1 h-1/2",
  bottom: "inset-x-1 bottom-1 h-1/2",
  center: "inset-1",
};

export function DockOverlay({ edge, className }: DockOverlayProps) {
  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 z-20", className)}>
      <div className={cn("absolute rounded-ui-sm border border-primary bg-primary/15", DOCK_RECT[edge])} />
    </div>
  );
}
