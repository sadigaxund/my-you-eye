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
