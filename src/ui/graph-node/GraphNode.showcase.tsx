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
            footer="3 cols · 894K rows"
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
            footer="3 cols · 894K rows"
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
            footer="3 cols · 894K rows"
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
            footer="12 cols · 1.2M rows"
            rows={[
              { label: "Pipeline", value: <span className="text-success font-medium">active</span>, portLeft: { side: "left", state: "connected" } },
              { label: "Rows", value: "1,234,567", portRight: { side: "right", state: "connected" } },
              { label: "Columns", value: "12" },
              { label: "Duration", value: "3.2s", portRight: { side: "right", state: "default" } },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Multi-output",
      render: () => (
        <div className="flex items-center justify-center h-48">
          <GraphNode
            x={0} y={0} className="static"
            header="user_events"
            accent
            footer="8 cols · 5.6M events"
            rows={[
              { label: "Stream A", value: "enriched", portRight: { side: "right", state: "connected" } },
              { label: "Stream B", value: "raw", portRight: { side: "right", state: "default" } },
              { label: "Source", value: "kafka", portLeft: { side: "left", state: "connected" } },
            ]}
          />
        </div>
      ),
    },
  ],
};
export default entry;
