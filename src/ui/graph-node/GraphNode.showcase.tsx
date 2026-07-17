import type { ShowcaseEntry } from "../../showcase/types";
import { GraphNode } from ".";

const entry: ShowcaseEntry = {
  title: "GraphNode",
  group: "canvas",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex items-center justify-center gap-4 h-48">
          <GraphNode
            x={0} y={0} className="static"
            header="sales_raw"
            accent
            footer="table"
            rows={[
              { label: "Status", value: <span className="text-success font-medium">running</span>, portLeft: { side: "left", state: "connected" } },
              { label: "Rows", value: "894K", portRight: { side: "right", state: "connected" } },
            ]}
          />
          <GraphNode
            x={0} y={0} className="static"
            header="sales_raw"
            variant="selected"
            accent
            footer="table"
            rows={[
              { label: "Status", value: <span className="text-success font-medium">running</span>, portLeft: { side: "left", state: "connected" } },
              { label: "Rows", value: "894K", portRight: { side: "right", state: "connected" } },
            ]}
          />
          <GraphNode
            x={0} y={0} className="static"
            header="sales_raw"
            variant="muted"
            accent
            footer="table"
            rows={[
              { label: "Status", value: <span className="text-success font-medium">running</span>, portLeft: { side: "left", state: "connected" } },
              { label: "Rows", value: "894K", portRight: { side: "right", state: "connected" } },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Connected node (accent + ports)",
      render: () => (
        <div className="relative" style={{ height: 220 }}>
          <GraphNode
            x={30}
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
      name: "Two ports same side",
      render: () => (
        <div className="relative" style={{ height: 180 }}>
          <GraphNode
            x={20}
            y={10}
            header="multi_output"
            accent
            rows={[
              { label: "Output A", value: "active", portRight: { side: "right", state: "connected" } },
              { label: "Output B", value: "standby", portRight: { side: "right", state: "default" } },
              { label: "Input C", value: "trigger", portLeft: { side: "left", state: "connected" } },
            ]}
          />
        </div>
      ),
    },
  ],
};
export default entry;
