import type { ShowcaseEntry } from "../../showcase/types";
import { ConnectionLayer } from ".";

const entry: ShowcaseEntry = {
  title: "ConnectionLayer",
  group: "canvas",
  description: "One shared <svg> for N edges — path, arrowhead and label rendering reused from ConnectionLine's ConnectionPath, not duplicated. Prefer this over stacking many standalone ConnectionLines for diagrams with lots of edges.",
  demos: [
    {
      name: "Many edges, one svg",
      render: () => (
        <div className="relative" style={{ width: 360, height: 220 }}>
          <ConnectionLayer
            edges={[
              { id: "api-queue", from: { x: 20, y: 20 }, to: { x: 340, y: 20 }, variant: "straight", state: "connected", arrowhead: true, label: "publish" },
              { id: "queue-worker-1", from: { x: 20, y: 80 }, to: { x: 340, y: 130 }, variant: "bezier", state: "connected", arrowhead: true, label: "consume" },
              { id: "queue-worker-2", from: { x: 20, y: 140 }, to: { x: 340, y: 130 }, variant: "bezier", state: "highlighted", arrowhead: true, label: "consume" },
              { id: "worker-db", from: { x: 20, y: 200 }, to: { x: 340, y: 190 }, variant: "stepped", state: "pending", arrowhead: true, label: "retry" },
            ]}
          />
        </div>
      ),
    },
    {
      name: "Edge states share the same visual language as ConnectionLine",
      render: () => (
        <div className="relative" style={{ width: 300, height: 140 }}>
          <ConnectionLayer
            edges={[
              { id: "default", from: { x: 10, y: 15 }, to: { x: 290, y: 15 }, state: "default" },
              { id: "connected", from: { x: 10, y: 50 }, to: { x: 290, y: 50 }, state: "connected" },
              { id: "highlighted", from: { x: 10, y: 85 }, to: { x: 290, y: 85 }, state: "highlighted" },
              { id: "pending", from: { x: 10, y: 120 }, to: { x: 290, y: 120 }, state: "pending" },
            ]}
          />
        </div>
      ),
    },
  ],
};
export default entry;
