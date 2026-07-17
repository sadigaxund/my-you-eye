import type { ShowcaseEntry } from "../../showcase/types";
import { GraphNode } from ".";

const entry: ShowcaseEntry = {
  title: "GraphNode",
  group: "canvas",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="relative" style={{ height: 180 }}>
          <GraphNode x={0} y={10} header="Default">Body content</GraphNode>
          <GraphNode x={200} y={10} header="Selected" variant="selected">Body content</GraphNode>
          <GraphNode x={400} y={10} header="Muted" variant="muted">Body content</GraphNode>
        </div>
      ),
    },
    {
      name: "With accent & top-level ports",
      render: () => (
        <div className="relative" style={{ height: 140 }}>
          <GraphNode x={10} y={10} header="Source" accent ports={[{ side: "right", label: "output", state: "connected" }]}>
            <div className="space-y-1">
              <div>Status: <span className="text-success">running</span></div>
              <div>Rows: 1,234</div>
            </div>
          </GraphNode>
        </div>
      ),
    },
    {
      name: "Multi-row with row-anchored ports",
      render: () => (
        <div className="relative" style={{ height: 260 }}>
          <GraphNode
            x={80}
            y={10}
            header="customer_orders"
            accent
            footer="12 columns"
            rows={[
              { label: "Status", value: <span className="text-success font-medium">running</span>, portLeft: { side: "left", state: "connected" } },
              { label: "Rows", value: "1,234,567", portRight: { side: "right", state: "connected" } },
              { label: "Columns", value: "12" },
              { label: "Duration", value: "3.2s", portRight: { side: "right", state: "default" } },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Two ports same side (no rows)",
      render: () => (
        <div className="relative" style={{ height: 140 }}>
          <GraphNode
            x={10}
            y={10}
            header="Multi-output"
            ports={[
              { side: "right", label: "output_a", state: "connected" },
              { side: "right", label: "output_b", state: "default" },
              { side: "left", label: "input", state: "connected" },
            ]}
          >
            Distributes ports vertically
          </GraphNode>
        </div>
      ),
    },
  ],
};
export default entry;
