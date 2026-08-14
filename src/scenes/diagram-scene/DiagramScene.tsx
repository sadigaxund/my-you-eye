import { useMemo } from "react";
import { cn } from "../../lib/cn";
import { Canvas } from "../../ui/canvas";
import { GraphNode } from "../../ui/graph-node";
import { GraphGroup } from "../../ui/graph-group";
import { ConnectionLayer } from "../../ui/connection-layer";
import type { ConnectionLayerEdge } from "../../ui/connection-layer";
import { generatePath } from "../../ui/connection-line";
import type { Point, ConnectionKind } from "../../ui/connection-line";
import { StatusDot } from "../../ui/status-dot";
import { Annotation } from "../../ui/annotation";
import { Reveal, Trace } from "../../motion";
import { useSequence, useTimeline } from "../../motion/core";
import type { MotionColor } from "../../motion/core";
import { sceneSteps, stepName } from "../timing";
import { PRESET_DEFAULTS, resolveNodeRects, resolveGroupRects, contentBounds, centerOffset, shiftRects } from "./DiagramScene.layout";
import type { NodeRect, GroupRect } from "./DiagramScene.layout";
import { edgeEndpoints, obstaclesExcluding } from "./DiagramScene.geometry";
import { useCanvasSize } from "./DiagramScene.useCanvasSize";
import { currentDiagramStepIndex, findRevealRange, findConnectRange, connectProgress, currentFocusIds, expandedFocusIds } from "./DiagramScene.steps";
import { useLiveInteraction } from "../interaction";
import type { DiagramScene as DiagramSceneData } from "../schema";

export interface DiagramSceneProps {
  scene: DiagramSceneData;
}

const KIND_TRACE_COLOR: Record<ConnectionKind, MotionColor> = {
  sync: "primary",
  async: "muted",
  data: "success",
  error: "danger",
};

function borderCenter(rect: NodeRect | GroupRect, side: "top" | "right" | "bottom" | "left"): Point {
  switch (side) {
    case "left": return { x: rect.x, y: rect.y + rect.height / 2 };
    case "top": return { x: rect.x + rect.width / 2, y: rect.y };
    case "bottom": return { x: rect.x + rect.width / 2, y: rect.y + rect.height };
    default: return { x: rect.x + rect.width, y: rect.y + rect.height / 2 };
  }
}

/**
 * `Canvas` + `GraphGroup` regions + `GraphNode`s + a `ConnectionLayer`,
 * driven by `DiagramScene` data (TODO.md Phase E). Node placement honours
 * explicit `x`/`y` (grid units) and falls back to `layered()`/`grid()`
 * (`DiagramScene.layout.ts`) — never hand-placed. Group rectangles are
 * computed from member-node bounds, never authored. Every reveal/connect/
 * flow/focus/annotate step behavior is derived from `useSequence`, the same
 * spine every other scene uses, so this scene's pacing can never drift from
 * `sceneDuration`.
 *
 * The annotation-inside-a-transform problem (TODO.md's "solve it once"):
 * `Annotation` renders as a plain DOM sibling of `GraphNode`/`GraphGroup`
 * *inside* `Canvas`'s own pannable/zoomable layer, using the exact same
 * untransformed canvas-space coordinates every node already uses. Because
 * it's a normal descendant of that transformed layer (not a portal to some
 * outer overlay), the browser's own CSS transform carries it along on every
 * pan/zoom frame for free — there is no separate sync code to get wrong.
 * `CodeScene` applies the identical pattern inside `Camera`'s transform.
 */
export function DiagramScene({ scene }: DiagramSceneProps) {
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const { frame } = useTimeline();
  const preset = PRESET_DEFAULTS[scene.preset ?? "architecture"];
  // Live-only (TODO.md D2/Phase F): INERT with no provider mounted (always
  // true for a video render or a plain static render), so every branch
  // below that reads `live` falls through to its pre-existing behavior.
  const live = useLiveInteraction();

  const laidOutNodes = useMemo(
    () => resolveNodeRects(scene.nodes, scene.edges, preset, scene.layout),
    [scene.nodes, scene.edges, preset, scene.layout],
  );
  const laidOutGroups = useMemo(() => resolveGroupRects(scene.groups ?? [], laidOutNodes), [scene.groups, laidOutNodes]);
  const bounds = useMemo(() => contentBounds(laidOutNodes, laidOutGroups), [laidOutNodes, laidOutGroups]);
  const { ref: canvasRef, size: canvasSize } = useCanvasSize(bounds);

  // Centre the whole diagram in the measured canvas. Applied to the rects
  // themselves rather than to a wrapper transform, so edges, flow tokens and
  // annotation callouts — all of which read these rects — stay in agreement
  // without a second coordinate space to keep in sync.
  const offset = useMemo(() => centerOffset(bounds, canvasSize), [bounds, canvasSize]);
  const nodeRects = useMemo(() => shiftRects(laidOutNodes, offset.dx, offset.dy), [laidOutNodes, offset]);
  const groupRects = useMemo(() => shiftRects(laidOutGroups, offset.dx, offset.dy), [laidOutGroups, offset]);

  const index = currentDiagramStepIndex(scene, ranges, frame);
  const currentStep = scene.steps[index] as DiagramSceneData["steps"][number] | undefined;
  // Authored `focus` wins when the step sets one; otherwise a live-only
  // "expanded" node (click, TODO.md D2) spotlights itself + its neighbors.
  // Both are `null` with no provider mounted, so `focusIds` is unchanged.
  const focusIds = currentFocusIds(currentStep) ?? expandedFocusIds(live.expandedNodeId, scene.edges);
  const stepRange = currentStep ? ranges[stepName(currentStep.id, index)] : undefined;
  const stepSpan = stepRange ? Math.max(1, stepRange.endFrame - stepRange.startFrame) : 1;
  const annotateProgress = stepRange ? Math.max(0, Math.min(1, (frame - stepRange.startFrame) / stepSpan)) : 1;

  // Pure geometry per edge — independent of reveal/connect staging, so a
  // `flow` step can look an edge's path up even if it happens to also be
  // the edge's own `connect` step (drawing on and flowing at once).
  const edgeGeometry = useMemo(() => {
    const map = new Map<string, { from: Point; to: Point; kind: ConnectionKind; route: NonNullable<DiagramSceneData["edges"][number]["route"]>; obstacles?: ReturnType<typeof obstaclesExcluding> }>();
    for (const e of scene.edges) {
      const id = e.id ?? `${e.from}->${e.to}`;
      const fromRect = nodeRects.get(e.from);
      const toRect = nodeRects.get(e.to);
      if (!fromRect || !toRect) continue;
      const { from, to } = edgeEndpoints(fromRect, toRect);
      const route = e.route ?? preset.edgeRoute;
      map.set(id, {
        from, to, kind: e.kind ?? preset.edgeKind, route,
        obstacles: route === "orthogonal" ? obstaclesExcluding(nodeRects, [e.from, e.to]) : undefined,
      });
    }
    return map;
  }, [scene.edges, nodeRects, preset]);

  const connectionEdges: ConnectionLayerEdge[] = useMemo(() => {
    const out: ConnectionLayerEdge[] = [];
    for (const e of scene.edges) {
      const id = e.id ?? `${e.from}->${e.to}`;
      const geo = edgeGeometry.get(id);
      if (!geo) continue;
      const progress = connectProgress(findConnectRange(id, scene, ranges), frame);
      if (progress <= 0) continue;
      // Live-only edge highlight (TODO.md D2): an edge touching the
      // hovered node gets ConnectionLine's existing "highlighted" state
      // (glow + brighter stroke — already used for authored connect
      // states, not a new visual). `hoveredNodeId` is always null with no
      // provider mounted, so `state` is always undefined then — identical
      // to before this prop existed on this call.
      const isHighlighted = live.hoveredNodeId != null && (e.from === live.hoveredNodeId || e.to === live.hoveredNodeId);
      out.push({
        id, from: geo.from, to: geo.to, variant: geo.route, kind: geo.kind,
        obstacles: geo.obstacles, label: e.label, arrowhead: true, progress,
        state: isHighlighted ? "highlighted" : undefined,
      });
    }
    return out;
  }, [scene, ranges, frame, edgeGeometry, live.hoveredNodeId]);

  const flowingEdgeIds = currentStep?.flow ?? [];
  const annotations = currentStep?.annotate ?? [];

  return (
    <div className="flex h-full w-full flex-col gap-stack bg-bg p-panel-xl text-fg">
      {scene.title && <h2 className="text-xl font-semibold text-fg">{scene.title}</h2>}
      <Canvas ref={canvasRef} className="min-h-0 flex-1 rounded-ui border border-border">
        {[...groupRects.values()].map((rect) => {
          const dimmed = focusIds != null && !focusIds.has(rect.id);
          const revealRange = findRevealRange(rect.id, scene, ranges);
          return (
            <Reveal key={rect.id} asChild from="fade" delay={revealRange?.startFrame ?? 0} duration={revealRange ? "normal" : "instant"}>
              <GraphGroup
                x={rect.x} y={rect.y} width={rect.width} height={rect.height}
                label={rect.data.label} border={rect.data.border}
                className={cn(dimmed && "opacity-dim")}
              />
            </Reveal>
          );
        })}
        {[...nodeRects.values()].map((rect) => {
          const node = rect.data;
          const dimmed = focusIds != null && !focusIds.has(node.id);
          const revealRange = findRevealRange(node.id, scene, ranges);
          // Live-only (TODO.md D2): `live.expandedNodeId` is always null and
          // `live.isLive` is always false with no provider mounted, so
          // `variant`/`className` both fall through to their pre-existing
          // expressions and the two handlers below are attached but never
          // fire (no click/hover ever happens during a video render or a
          // static render) — none of this changes rendered DOM.
          const isExpanded = live.expandedNodeId === node.id;
          return (
            <Reveal key={node.id} asChild from="scale" delay={revealRange?.startFrame ?? 0} duration={revealRange ? "normal" : "instant"}>
              <GraphNode
                x={rect.x} y={rect.y}
                // Render at exactly the width layout reserved. GraphNode is
                // otherwise content-sized, so a short label produced a node
                // far narrower than its own footprint — the spacing then
                // read as arbitrary gaps, and every edge endpoint computed
                // from `rect` missed the box it was supposed to touch.
                style={{ width: rect.width }}
                variant={isExpanded ? "selected" : rect.simple ? "simple" : "default"}
                shape={preset.nodeShape}
                header={node.label}
                subtitle={node.sublabel}
                headerDots={false}
                headerStatus={node.status ? <StatusDot variant={node.status} size="sm" /> : undefined}
                footer={node.metric}
                accent={Boolean(node.accent)}
                accentColor={node.accent}
                className={cn(dimmed && "opacity-dim", live.isLive && "cursor-pointer")}
                onMouseEnter={() => live.onNodeHover(node.id)}
                onMouseLeave={() => live.onNodeHover(null)}
                onClick={(e) => {
                  // Stop the click here so it doesn't also bubble up to
                  // Presenter's "click background to advance" handler —
                  // clicking a node should only toggle its expanded state.
                  e.stopPropagation();
                  live.onNodeClick(node.id);
                }}
              />
            </Reveal>
          );
        })}
        <ConnectionLayer edges={connectionEdges} />
        {flowingEdgeIds.map((edgeId) => {
          const geo = edgeGeometry.get(edgeId);
          if (!geo) return null;
          const d = generatePath(geo.from, geo.to, geo.route, { obstacles: geo.obstacles });
          return (
            <Trace
              key={edgeId}
              d={d}
              viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
              className="absolute inset-0 h-full w-full"
              color={KIND_TRACE_COLOR[geo.kind]}
              count={2}
              duration="slow"
            />
          );
        })}
        {annotations.map((a, i) => {
          const rect = nodeRects.get(a.target) ?? groupRects.get(a.target);
          if (!rect) return null;
          const side = a.side ?? "right";
          return (
            <Annotation
              key={`${a.target}-${i}`}
              target={borderCenter(rect, side)}
              label={a.text}
              side={side}
              progress={annotateProgress}
            />
          );
        })}
      </Canvas>
    </div>
  );
}
