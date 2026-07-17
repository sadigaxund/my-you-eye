import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas } from ".";
import { GraphNode } from "../graph-node";

const entry: ShowcaseEntry = {
  title: "Canvas",
  group: "canvas",
  demos: [
    {
      name: "Empty grid",
      render: () => (
        <Canvas className="h-48 w-full rounded-ui border border-border" />
      ),
    },
    {
      name: "With nodes (drag to pan, ctrl+scroll to zoom)",
      render: () => (
        <Canvas className="h-80 w-full rounded-ui border border-border">
          <GraphNode x={40} y={30} header="Extract" accent ports={[{ side: "right", state: "connected" }]}>API → Raw</GraphNode>
          <GraphNode x={280} y={30} header="Transform" variant="selected" accent ports={[{ side: "left", state: "connected" }, { side: "right", state: "connected" }]}>Clean + Map</GraphNode>
          <GraphNode x={520} y={30} header="Load" accent ports={[{ side: "left", state: "connected" }]}>DB → Warehouse</GraphNode>
        </Canvas>
      ),
    },
  ],
};
export default entry;
