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
import { PRESET_DEFAULTS, resolveNodeRects, resolveGroupRects, contentBounds } from "./DiagramScene.layout";
import type { NodeRect, GroupRect } from "./DiagramScene.layout";
import { edgeEndpoints, obstaclesExcluding } from "./DiagramScene.geometry";
import { useCanvasSize } from "./DiagramScene.useCanvasSize";
import { currentDiagramStepIndex, findRevealRange, findConnectRange, connectProgress, currentFocusIds } from "./DiagramScene.steps";
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

  const nodeRects = useMemo(
    () => resolveNodeRects(scene.nodes, scene.edges, preset, scene.layout),
    [scene.nodes, scene.edges, preset, scene.layout],
  );
  const groupRects = useMemo(() => resolveGroupRects(scene.groups ?? [], nodeRects), [scene.groups, nodeRects]);
  const bounds = useMemo(() => contentBounds(nodeRects, groupRects), [nodeRects, groupRects]);
  const { ref: canvasRef, size: canvasSize } = useCanvasSize(bounds);

  const index = currentDiagramStepIndex(scene, ranges, frame);
  const currentStep = scene.steps[index] as DiagramSceneData["steps"][number] | undefined;
  const focusIds = currentFocusIds(currentStep);
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
      out.push({
        id, from: geo.from, to: geo.to, variant: geo.route, kind: geo.kind,
        obstacles: geo.obstacles, label: e.label, arrowhead: true, progress,
      });
    }
    return out;
  }, [scene, ranges, frame, edgeGeometry]);

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
          return (
            <Reveal key={node.id} asChild from="scale" delay={revealRange?.startFrame ?? 0} duration={revealRange ? "normal" : "instant"}>
              <GraphNode
                x={rect.x} y={rect.y}
                variant={rect.simple ? "simple" : "default"}
                shape={preset.nodeShape}
                header={node.label}
                subtitle={node.sublabel}
                headerDots={false}
                headerStatus={node.status ? <StatusDot variant={node.status} size="sm" /> : undefined}
                footer={node.metric}
                accent={Boolean(node.accent)}
                accentColor={node.accent}
                className={cn(dimmed && "opacity-dim")}
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
