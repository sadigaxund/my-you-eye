import type { ShowcaseEntry } from "../../showcase/types";
import { GraphNode } from ".";
import { StatusDot } from "../status-dot";
import { Badge } from "../badge";
import { Button } from "../button";

function ServerIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-full fill-none stroke-current" strokeWidth="1.3">
      <rect x="1.5" y="1.5" width="9" height="3.5" rx="0.75" />
      <rect x="1.5" y="7" width="9" height="3.5" rx="0.75" />
      <circle cx="3.25" cy="3.25" r="0.4" fill="currentColor" stroke="none" />
      <circle cx="3.25" cy="8.75" r="0.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

const entry: ShowcaseEntry = {
  title: "GraphNode",
  group: "canvas",
  description: "A node block for graph/flow diagrams with a fixed grid-aligned corner radius, header/rows/footer, and left/right ports.",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex items-center justify-center gap-4 h-56">
          <GraphNode
            x={0} y={0} className="static"
            header="orders"
            accent
            footer="idle"
            rows={[
              { label: "Status", value: <span className="text-success font-medium">running</span>, portLeft: { side: "left", state: "connected" } },
              { label: "Recency", value: "2026-07-17", portRight: { side: "right", state: "connected" } },
            ]}
          />
          <GraphNode
            x={0} y={0} className="static"
            header="orders"
            variant="selected"
            accent
            footer="selected"
            rows={[
              { label: "Status", value: <span className="text-success font-medium">running</span>, portLeft: { side: "left", state: "connected" } },
              { label: "Recency", value: "2026-07-17", portRight: { side: "right", state: "connected" } },
            ]}
          />
          <GraphNode
            x={0} y={0} className="static"
            header="orders"
            variant="muted"
            accent
            footer="muted"
            rows={[
              { label: "Status", value: <span className="text-success font-medium">running</span>, portLeft: { side: "left", state: "connected" } },
              { label: "Recency", value: "2026-07-17", portRight: { side: "right", state: "connected" } },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Simple variant",
      render: () => (
        <div className="flex items-center justify-center gap-4 h-56">
          <GraphNode
            x={0} y={0} className="static"
            header="Simple Node"
            variant="simple"
            rows={[
              { label: "Label 1", value: "Value 1" },
              { label: "Label 2", value: <span className="text-success font-medium">42</span> },
            ]}
          />
          <GraphNode
            x={0} y={0} className="static"
            header="Minimal"
            variant="simple"
            rows={[
              { label: "Key", value: "Val" },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Legacy ports on a tall node",
      description: "ports without rows distribute across the node's real measured height and snap to grid lines, instead of being squeezed into the header band whatever the body height is.",
      render: () => (
        <div className="flex items-center justify-center h-72">
          <GraphNode
            x={0} y={0} className="static"
            header="Tall Node"
            footer="6 ports"
            ports={[
              { side: "left", label: "in-1", state: "connected" },
              { side: "left", label: "in-2" },
              { side: "left", label: "in-3", state: "highlighted" },
              { side: "right", label: "out-1", state: "connected" },
              { side: "right", label: "out-2" },
              { side: "right", label: "out-3", state: "highlighted" },
            ]}
          >
            <div className="flex flex-col gap-2 py-3 px-2">
              <div className="h-6 rounded-ui-sm bg-muted/10" />
              <div className="h-6 rounded-ui-sm bg-muted/10" />
              <div className="h-6 rounded-ui-sm bg-muted/10" />
              <div className="h-6 rounded-ui-sm bg-muted/10" />
            </div>
          </GraphNode>
        </div>
      ),
    },
    {
      name: "Free-form body",
      render: () => (
        <div className="flex items-center justify-center gap-4 h-56">
          <GraphNode x={0} y={0} className="static" header="Custom Box" variant="simple">
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <span className="text-2xl font-bold text-primary">42</span>
              <span className="text-xs text-muted">active tasks</span>
            </div>
          </GraphNode>
          <GraphNode x={0} y={0} className="static" header="Metrics" variant="simple">
            <div className="flex gap-3 px-2 py-3">
              <div className="flex flex-col items-center"><span className="text-lg font-semibold">8</span><span className="text-xs text-muted">CPU</span></div>
              <div className="flex flex-col items-center"><span className="text-lg font-semibold">64</span><span className="text-xs text-muted">GB</span></div>
              <div className="flex flex-col items-center"><span className="text-lg font-semibold">3</span><span className="text-xs text-muted">GPU</span></div>
            </div>
          </GraphNode>
        </div>
      ),
    },
    {
      name: "Header variations",
      description: "headerIcon, headerStatus and subtitle compose independently. headerIcon renders in a tinted accentColor tile as the node's type mark, subtitle adds one whole grid cell to the header so rows and ports stay grid-aligned, and headerDots (the mac window buttons) is off by default and belongs only on a node that depicts an actual app window.",
      render: () => (
        <div className="flex flex-wrap items-start justify-center gap-4">
          <GraphNode
            x={0} y={0} className="static"
            header="api-gateway"
            headerIcon={<ServerIcon />}
            rows={[{ label: "Region", value: "us-east-1" }]}
          />
          <GraphNode
            x={0} y={0} className="static"
            header="worker-pool"
            headerStatus={<StatusDot variant="success" pulse />}
            rows={[{ label: "Replicas", value: "6" }]}
          />
          <GraphNode
            x={0} y={0} className="static"
            header="orders-db"
            subtitle="postgres · primary"
            rows={[{ label: "Connections", value: "128" }]}
          />
          <GraphNode
            x={0} y={0} className="static"
            header="app.example.com"
            headerDots
            rows={[{ label: "Hit rate", value: "94%" }]}
          />
        </div>
      ),
    },
    {
      name: "Accent bar color",
      description: "accentColor picks the accent bar's color and defaults to \"primary\", which matches the original look exactly. It shows only when accent is true.",
      render: () => (
        <div className="flex flex-wrap items-center justify-center gap-4">
          {(["primary", "success", "warning", "danger", "muted"] as const).map((color) => (
            <GraphNode
              key={color}
              x={0} y={0} className="static"
              header={color}
              accent
              accentColor={color}
              rows={[{ label: "Status", value: color }]}
            />
          ))}
        </div>
      ),
    },
    {
      name: "Footer variations",
      description: "footerMetric, footerAction and footerProgress compose alongside footer's own text inside the same fixed one-cell footer row, and footerProgress reuses Progress rather than a hand-rolled bar.",
      render: () => (
        <div className="flex flex-wrap items-start justify-center gap-4">
          <GraphNode
            x={0} y={0} className="static"
            header="queue"
            footer="pending"
            footerMetric="1.2k"
            rows={[{ label: "Consumers", value: "3" }]}
          />
          <GraphNode
            x={0} y={0} className="static"
            header="deploy"
            footer="build #482"
            footerAction={<Button type="button" variant="ghost" size="icon-sm" aria-label="Retry">↻</Button>}
            rows={[{ label: "Branch", value: "main" }]}
          />
          <GraphNode
            x={0} y={0} className="static"
            header="migration"
            footer="running"
            footerProgress={62}
            rows={[{ label: "Table", value: "users" }]}
          />
        </div>
      ),
    },
    {
      name: "Shape (state-machine pill)",
      description: "shape=\"pill\" swaps the fixed rounded-node radius (\"box\", the default) for a fully rounded corner, for the state-machine nodes in DiagramScene's \"state\" preset. Pair it with variant=\"simple\" so no header rule or rows sit oddly inside the pill.",
      render: () => (
        <div className="flex flex-wrap items-center justify-center gap-4">
          <GraphNode x={0} y={0} className="static" header="idle" variant="simple" shape="pill" />
          <GraphNode x={0} y={0} className="static" header="running" variant="selected" shape="pill" />
          <GraphNode x={0} y={0} className="static" header="failed" variant="muted" shape="pill" />
        </div>
      ),
    },
    {
      name: "All variations together",
      render: () => (
        <div className="flex items-start justify-center">
          <GraphNode
            x={0} y={0} className="static"
            header="payments-svc"
            headerIcon={<ServerIcon />}
            headerStatus={<Badge variant="success" tone="soft" className="px-1.5 py-0 text-xs leading-none">live</Badge>}
            subtitle="eu-west-1 · v2.4.1"
            accent
            accentColor="success"
            footer="healthy"
            footerProgress={88}
            rows={[
              { label: "Status", value: <span className="text-success font-medium">running</span>, portLeft: { side: "left", state: "connected" } },
              { label: "RPS", value: "1,204", portRight: { side: "right", state: "connected" } },
            ]}
          />
        </div>
      ),
    },
  ],
};
export default entry;
