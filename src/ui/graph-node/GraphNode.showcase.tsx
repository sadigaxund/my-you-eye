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
  ],
};
export default entry;
