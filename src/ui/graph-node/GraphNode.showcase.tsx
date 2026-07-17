import type { ShowcaseEntry } from "../../showcase/types";
import { GraphNode } from ".";

const entry: ShowcaseEntry = {
  title: "GraphNode",
  group: "canvas",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="relative min-h-[160px]">
          <GraphNode x={0} y={10} header="Default">Body content</GraphNode>
          <GraphNode x={200} y={10} header="Selected" variant="selected">Body content</GraphNode>
          <GraphNode x={400} y={10} header="Muted" variant="muted">Body content</GraphNode>
        </div>
      ),
    },
    {
      name: "With accent & ports",
      render: () => (
        <div className="relative min-h-[120px]">
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
      name: "With rows",
      render: () => (
        <div className="relative min-h-[140px]">
          <GraphNode
            x={10}
            y={10}
            header="customer_orders"
            accent
            ports={[
              { side: "left", label: "input", state: "connected" },
              { side: "right", label: "output", state: "connected" },
            ]}
            rows={[
              { label: "Status", value: <span className="text-success font-medium">running</span> },
              { label: "Rows", value: "1,234,567" },
              { label: "Columns", value: "12" },
              { label: "Duration", value: "3.2s" },
            ]}
          />
        </div>
      ),
    },
  ],
};
export default entry;
