import type { ShowcaseEntry } from "../../showcase/types";
import { GraphNode } from ".";

const entry: ShowcaseEntry = {
  title: "GraphNode",
  group: "canvas",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex items-center justify-center gap-4 h-56">
          <GraphNode
            x={0} y={0} className="static"
            header="orders"
            accent
            footer="table"
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
            footer="table"
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
            footer="table"
            rows={[
              { label: "Status", value: <span className="text-success font-medium">running</span>, portLeft: { side: "left", state: "connected" } },
              { label: "Recency", value: "2026-07-17", portRight: { side: "right", state: "connected" } },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Connected node",
      render: () => (
        <div className="flex items-center justify-center h-56">
          <GraphNode
            x={0} y={0} className="static"
            header="customer_orders"
            accent
            footer="transform"
            rows={[
              { label: "Pipeline", value: <span className="text-success font-medium">active</span>, portLeft: { side: "left", state: "connected" } },
              { label: "Rows in", value: "2,134,567", portLeft: { side: "left", state: "connected" } },
              { label: "Rows out", value: "1,234,567", portRight: { side: "right", state: "connected" } },
              { label: "Stream B", value: "standby", portRight: { side: "right", state: "default" } },
            ]}
          />
        </div>
      ),
    },
  ],
};
export default entry;
