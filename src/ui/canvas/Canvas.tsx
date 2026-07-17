import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface CanvasProps extends HTMLAttributes<HTMLDivElement> {
  gridSize?: number;
}

const Canvas = forwardRef<HTMLDivElement, CanvasProps>(
  ({ className, gridSize = 20, children, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden bg-bg",
        "[background-image:radial-gradient(circle,var(--color-border)_0.5px,transparent_0.5px)]",
        className,
      )}
      style={{ backgroundSize: `${gridSize}px ${gridSize}px`, ...style }}
      {...props}
    >
      {children}
    </div>
  ),
);
Canvas.displayName = "Canvas";

export { Canvas };
