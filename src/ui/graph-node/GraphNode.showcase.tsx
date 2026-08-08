import type { ShowcaseEntry } from "../../showcase/types";
import { GraphNode } from ".";

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
      description: "ports (no rows) distribute across the node's real measured height, snapped to grid lines — not squeezed into the header band regardless of body height.",
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
  ],
};
export default entry;
