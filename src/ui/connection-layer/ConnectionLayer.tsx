import { forwardRef, useMemo, useState } from "react";
import type { SVGAttributes } from "react";
import { cn } from "../../lib/cn";
import {
  ConnectionPath,
  ConnectionLabelPortalContext,
  computeBundleOffsets,
  findClearLabelT,
  getRoutePoints,
} from "../connection-line";
import type { ConnectionLineProps, ConnectionVariant } from "../connection-line";

export interface ConnectionLayerEdge extends ConnectionLineProps {
  /** Stable identity for the edge (React key + future per-edge interaction). */
  id: string | number;
}

export interface ConnectionLayerProps extends Omit<SVGAttributes<SVGSVGElement>, "id"> {
  /** Edges to render. Each shares the exact path/arrowhead/label rendering
   * (`ConnectionPath`) that `ConnectionLine` uses standalone — nothing about
   * an edge is computed twice. */
  edges: ConnectionLayerEdge[];
  /** Automatically nudges apart edges that share an endpoint pair (default
   * true). Set false to place every edge exactly at its given coordinates,
   * e.g. when you've already computed distinct routes yourself. */
  bundleParallelEdges?: boolean;
  /** Automatically searches for a label position clear of every other
   * edge's path when an edge has a `label` but no explicit `labelPosition`
   * (default true). Sets false to always use the edge's own `labelPosition`
   * (or the 50% midpoint default). */
  autoLabelPlacement?: boolean;
}

/**
 * Renders many edges inside a single `<svg>`, instead of stacking one
 * full-size `absolute inset-0` svg per edge (`ConnectionLine`'s standalone
 * behavior). For a diagram with dozens of edges, that avoids dozens of
 * stacking contexts and z-order fights with node elements sharing the same
 * canvas space — see AGENTS.md TODO A3 / D3.
 *
 * Two things a single stacked `ConnectionLine` per edge can't do, which
 * `ConnectionLayer` does automatically because it can see every edge at
 * once:
 * - **Parallel-edge bundling** — edges sharing an endpoint pair are fanned
 *   out (`computeBundleOffsets`) instead of overlapping into one
 *   indistinguishable stroke.
 * - **Label paint order** — every label is portaled into a `<g>` rendered
 *   after every edge's stroke (`ConnectionLabelPortalContext`), so a label
 *   can never be occluded by another edge's line, and (when
 *   `autoLabelPlacement` is on) each label first tries to land somewhere
 *   that isn't already crossed by another edge (`findClearLabelT`).
 *
 * `ConnectionLine` keeps working standalone and unchanged; use
 * `ConnectionLayer` instead when you already have an edge list to render in
 * bulk (e.g. a `DiagramScene`).
 */
const ConnectionLayer = forwardRef<SVGSVGElement, ConnectionLayerProps>(
  ({ className, edges, bundleParallelEdges = true, autoLabelPlacement = true, ...props }, ref) => {
    const [labelLayer, setLabelLayer] = useState<SVGGElement | null>(null);

    const bundleOffsets = useMemo(
      () => (bundleParallelEdges ? computeBundleOffsets(edges) : edges.map(() => 0)),
      [edges, bundleParallelEdges],
    );

    const routes = useMemo(
      () =>
        edges.map((e, i) =>
          getRoutePoints(e.from, e.to, (e.variant ?? "bezier") as ConnectionVariant, {
            waypoints: e.waypoints,
            obstacles: e.obstacles,
            offset: e.offset ?? bundleOffsets[i],
          }),
        ),
      [edges, bundleOffsets],
    );

    const labelPositions = useMemo(
      () =>
        edges.map((e, i) => {
          if (!autoLabelPlacement || !e.label || e.labelPosition != null) return e.labelPosition;
          const others = routes.filter((_, j) => j !== i);
          return findClearLabelT(e.from, e.to, e.variant ?? "bezier", {
            waypoints: e.waypoints,
            obstacles: e.obstacles,
            offset: e.offset ?? bundleOffsets[i],
          }, others);
        }),
      [edges, routes, bundleOffsets, autoLabelPlacement],
    );

    return (
      <svg
        ref={ref}
        className={cn("absolute inset-0 w-full h-full pointer-events-none overflow-visible", className)}
        {...props}
      >
        <ConnectionLabelPortalContext.Provider value={labelLayer}>
          {edges.map(({ id, offset, ...edge }, i) => (
            <g key={id}>
              <ConnectionPath {...edge} offset={offset ?? bundleOffsets[i]} labelPosition={labelPositions[i]} />
            </g>
          ))}
        </ConnectionLabelPortalContext.Provider>
        {/* Every label portals in here (see ConnectionLabelPortalContext) —
            rendered last so it paints above every edge's stroke regardless
            of edge order. */}
        <g ref={setLabelLayer} />
      </svg>
    );
  },
);
ConnectionLayer.displayName = "ConnectionLayer";

export { ConnectionLayer };
