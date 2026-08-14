import type { ShowcaseEntry } from "../../showcase/types";
import { GraphGroup } from ".";
import { Canvas } from "../canvas";
import { GraphNode } from "../graph-node";
import { ConnectionLayer } from "../connection-layer";
import { StatusDot } from "../status-dot";
import { GRID, nodeHeightPx } from "../graph-node/grid";

function CloudIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-full fill-none stroke-current" strokeWidth="1.3">
      <path d="M3.25 9h5.1a2.15 2.15 0 0 0 .2-4.29A3 3 0 0 0 2.9 5.1 2 2 0 0 0 3.25 9Z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-full fill-none stroke-current" strokeWidth="1.3">
      <rect x="2.75" y="5.25" width="6.5" height="5" rx="1" />
      <path d="M4.25 5.25v-1.5a1.75 1.75 0 0 1 3.5 0v1.5" />
    </svg>
  );
}

// Node boxes declared once and used for BOTH placement and edge anchoring,
// so the two can't disagree. Width is set explicitly (a GRID multiple)
// because a GraphNode's width is otherwise content-driven, and an anchor
// needs a known rect — the height comes from the grid formula rather than a
// guess: 2 rows, no footer.
const NODE_W = 11 * GRID; // 176
const NODE_H = nodeHeightPx(2, false); // 96
const PG = { x: 5 * GRID, y: 8 * GRID };
const API = { x: 26 * GRID, y: 8 * GRID };
const PG_RECT = { ...PG, width: NODE_W, height: NODE_H };
const API_RECT = { ...API, width: NODE_W, height: NODE_H };

/** Every coordinate here is a multiple of GRID (16) — see AGENTS.md §7. */
const entry: ShowcaseEntry = {
  title: "GraphGroup",
  group: "canvas",
  description:
    "A labelled boundary region — VPC, cluster, service boundary — drawn behind the nodes and edges it encloses. Render groups before nodes in JSX: stacking is DOM order, not z-index.",
  demos: [
    {
      name: "Architecture boundaries",
      description:
        "An outer region with two nested regions inside it. Groups come first in the JSX, so nodes and edges paint on top of them.",
      render: () => (
        <Canvas className="h-[352px] w-full rounded-ui border border-border">
          {/* Groups first: outer, then inner, then nodes, then edges. */}
          <GraphGroup
            x={16} y={32} width={656} height={272}
            label="VPC · us-east-1" icon={<CloudIcon />} accentColor="muted"
          />
          <GraphGroup
            x={48} y={80} width={272} height={192}
            label="Private subnet" icon={<LockIcon />} accentColor="primary"
          />
          <GraphGroup
            x={384} y={80} width={256} height={192}
            label="Public subnet" accentColor="success" border="solid"
          />
          <GraphNode
            {...PG} style={{ width: PG_RECT.width }}
            header="postgres" headerStatus={<StatusDot variant="success" size="sm" />} accent
            rows={[
              { label: "Role", value: "primary", portLeft: { side: "left", state: "connected" } },
              { label: "Lag", value: "0 ms" },
            ]}
          />
          <GraphNode
            {...API} style={{ width: API_RECT.width }}
            header="api" headerStatus={<StatusDot variant="success" size="sm" />} accent
            rows={[
              { label: "Replicas", value: "3" },
              { label: "p99", value: "42 ms", portRight: { side: "right", state: "connected" } },
            ]}
          />
          {/* Endpoints are the node RECTS, not hand-picked coordinates. The
              edge previously ran from {416,208} to {240,176} — two numbers
              eyeballed against the nodes, which is exactly what the anchor
              system exists to remove: they were already slightly off, so the
              stroke entered the api node and the arrowhead landed inside
              postgres. */}
          <ConnectionLayer
            edges={[
              { id: "db", from: { rect: API_RECT }, to: { rect: PG_RECT }, kind: "sync", label: "5432", arrowhead: true },
            ]}
          />
        </Canvas>
      ),
    },
    {
      name: "Label placement",
      description:
        "`outside-top` floats the chip above the region, for when a node sits flush against the group's own top-left corner.",
      render: () => (
        <Canvas className="h-[256px] w-full rounded-ui border border-border">
          <GraphGroup x={32} y={64} width={192} height={144} label="top-left" accentColor="primary" />
          <GraphGroup x={256} y={64} width={192} height={144} label="top-center" labelPlacement="top-center" accentColor="success" />
          <GraphGroup x={480} y={64} width={192} height={144} label="outside-top" labelPlacement="outside-top" accentColor="warning" />
        </Canvas>
      ),
    },
  ],
};
export default entry;
