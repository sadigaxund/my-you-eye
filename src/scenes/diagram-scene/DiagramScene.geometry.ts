// Edge endpoint + obstacle geometry for DiagramScene — turns two NodeRects
// into a `from`/`to` Point pair on their facing borders (so an edge attaches
// to whichever side of the box actually faces the other node, regardless of
// layout direction), plus the obstacle-rect list `ConnectionLine`'s
// `orthogonal` route detours around. Pure, no React.

import type { Point } from "../../ui/connection-line";
import type { NodeRect } from "./DiagramScene.layout";

/** Border attachment point on `rect` facing `towards` — picks the side
 * (left/right/top/bottom) on the dominant axis between the two rect
 * centers, so a mostly-horizontal relationship attaches left/right and a
 * mostly-vertical one attaches top/bottom. This is what makes an edge look
 * right regardless of preset/layout direction, including "back" edges
 * (target ranked before source) without any special-casing. */
function borderPoint(rect: NodeRect, towards: Point): Point {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const dx = towards.x - cx;
  const dy = towards.y - cy;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return { x: dx >= 0 ? rect.x + rect.width : rect.x, y: cy };
  }
  return { x: cx, y: dy >= 0 ? rect.y + rect.height : rect.y };
}

function center(rect: NodeRect): Point {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

/** The `from`/`to` points an edge between two nodes should actually draw
 * between — each end lands on the facing border of its own node, not the
 * node's raw center (which would draw straight through both boxes). */
export function edgeEndpoints(fromRect: NodeRect, toRect: NodeRect): { from: Point; to: Point } {
  const from = borderPoint(fromRect, center(toRect));
  const to = borderPoint(toRect, center(fromRect));
  return { from, to };
}

export interface ObstacleRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Every node rect except the edge's own two endpoints, for `orthogonal`
 * route obstacle avoidance — a node routing around itself would be
 * meaningless (and the endpoint IS the route's own start/end point). */
export function obstaclesExcluding(nodeRects: Map<string, NodeRect>, excludeIds: string[]): ObstacleRect[] {
  const exclude = new Set(excludeIds);
  return [...nodeRects.values()]
    .filter((r) => !exclude.has(r.id))
    .map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height }));
}
