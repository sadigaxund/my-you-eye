import { forwardRef } from "react";
import type { SVGAttributes } from "react";
import { cn } from "../../lib/cn";
import { ConnectionPath } from "../connection-line";
import type { ConnectionLineProps } from "../connection-line";

export interface ConnectionLayerEdge extends ConnectionLineProps {
  /** Stable identity for the edge (React key + future per-edge interaction). */
  id: string | number;
}

export interface ConnectionLayerProps extends Omit<SVGAttributes<SVGSVGElement>, "id"> {
  /** Edges to render. Each shares the exact path/arrowhead/label rendering
   * (`ConnectionPath`) that `ConnectionLine` uses standalone — nothing about
   * an edge is computed twice. */
  edges: ConnectionLayerEdge[];
}

/**
 * Renders many edges inside a single `<svg>`, instead of stacking one
 * full-size `absolute inset-0` svg per edge (`ConnectionLine`'s standalone
 * behavior). For a diagram with dozens of edges, that avoids dozens of
 * stacking contexts and z-order fights with node elements sharing the same
 * canvas space — see AGENTS.md TODO A3 / D3.
 *
 * `ConnectionLine` keeps working standalone and unchanged; use
 * `ConnectionLayer` instead when you already have an edge list to render in
 * bulk (e.g. a `DiagramScene`).
 */
const ConnectionLayer = forwardRef<SVGSVGElement, ConnectionLayerProps>(
  ({ className, edges, ...props }, ref) => (
    <svg
      ref={ref}
      className={cn("absolute inset-0 w-full h-full pointer-events-none overflow-visible", className)}
      {...props}
    >
      {edges.map(({ id, ...edge }) => (
        <g key={id}>
          <ConnectionPath {...edge} />
        </g>
      ))}
    </svg>
  ),
);
ConnectionLayer.displayName = "ConnectionLayer";

export { ConnectionLayer };
