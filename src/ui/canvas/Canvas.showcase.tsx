import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas, Edge } from ".";
import { GraphNode } from "../graph-node";
import { StatusDot } from "../status-dot";
import { GRID, portY } from "../graph-node/grid";

// Node geometry declared once and reused for placement AND edge endpoints,
// so the two cannot drift apart. Width is explicit (a GRID multiple) because
// a GraphNode is otherwise content-sized; the vertical endpoint of every edge
// comes from `portY()` — the same grid formula the node uses to place its own
// port dots (AGENTS.md §7), never an eyeballed y.
const NODE_W = 11 * GRID; // 176

const INGEST = { x: 2 * GRID, y: 4 * GRID };
const TRANSFORM = { x: 17 * GRID, y: 4 * GRID };
const WAREHOUSE = { x: 32 * GRID, y: 9 * GRID };

/** Right-edge port point for row `i` of a node placed at `n`. */
function rightPort(n: { x: number; y: number }, row: number) {
  return { x: n.x + NODE_W, y: n.y + portY(row) };
}
/** Left-edge port point for row `i` of a node placed at `n`. */
function leftPort(n: { x: number; y: number }, row: number) {
  return { x: n.x, y: n.y + portY(row) };
}

const entry: ShowcaseEntry = {
  title: "Canvas",
  group: "canvas",
  description:
    "An infinite pan/zoom surface with a GPU-composited grid background, used as the base layer for node graphs.",
  demos: [
    {
      name: "Empty grid",
      render: () => <Canvas className="h-[344px] w-full rounded-ui border border-border" />,
    },
    {
      name: "Populated graph",
      description:
        "Drag the background to pan, ⌘/Ctrl + scroll to zoom. Nodes and edges live inside the transformed layer, so they move as one.",
      render: () => (
        <Canvas className="h-[400px] w-full rounded-ui border border-border">
          {/* Edges paint under the nodes: one <svg> for the whole layer, sized
              to the canvas viewport and non-interactive so drag-to-pan still
              reaches the background beneath it. */}
          <svg className="pointer-events-none absolute inset-0 size-full overflow-visible">
            <Edge from={rightPort(INGEST, 1)} to={leftPort(TRANSFORM, 0)} state="connected" />
            <Edge from={rightPort(TRANSFORM, 1)} to={leftPort(WAREHOUSE, 0)} state="connected" />
            <Edge from={rightPort(INGEST, 0)} to={leftPort(WAREHOUSE, 1)} state="pending" />
          </svg>
          <GraphNode
            {...INGEST}
            style={{ width: NODE_W }}
            header="ingest"
            headerStatus={<StatusDot variant="success" size="sm" />}
            accent
            rows={[
              { label: "Source", value: "kafka", portRight: { side: "right", state: "default" } },
              { label: "Rate", value: "12k/s", portRight: { side: "right", state: "connected" } },
            ]}
          />
          <GraphNode
            {...TRANSFORM}
            style={{ width: NODE_W }}
            header="transform"
            headerStatus={<StatusDot variant="success" size="sm" />}
            accent
            rows={[
              { label: "Stage", value: "normalise", portLeft: { side: "left", state: "connected" } },
              { label: "p99", value: "38 ms", portRight: { side: "right", state: "connected" } },
            ]}
          />
          <GraphNode
            {...WAREHOUSE}
            style={{ width: NODE_W }}
            header="warehouse"
            headerStatus={<StatusDot variant="warning" size="sm" />}
            accent
            rows={[
              { label: "Table", value: "events", portLeft: { side: "left", state: "connected" } },
              { label: "Backfill", value: "queued", portLeft: { side: "left", state: "default" } },
            ]}
          />
        </Canvas>
      ),
    },
    {
      name: "Edge states",
      description: "Edge is Canvas's own bezier connector: default, connected, highlighted, pending.",
      render: () => (
        <Canvas className="h-[256px] w-full rounded-ui border border-border">
          <svg className="pointer-events-none absolute inset-0 size-full overflow-visible">
            <Edge from={{ x: 48, y: 48 }} to={{ x: 288, y: 48 }} />
            <Edge from={{ x: 48, y: 96 }} to={{ x: 288, y: 96 }} state="connected" />
            <Edge from={{ x: 48, y: 144 }} to={{ x: 288, y: 144 }} state="highlighted" />
            <Edge from={{ x: 48, y: 192 }} to={{ x: 288, y: 192 }} state="pending" />
          </svg>
        </Canvas>
      ),
    },
  ],
};
export default entry;
