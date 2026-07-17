import type { ShowcaseEntry } from "../../showcase/types";
import { GraphNode } from ".";
import { Canvas } from "../canvas";

const entry: ShowcaseEntry = {
  title: "GraphNode",
  group: "canvas",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="relative flex flex-wrap gap-4 min-h-[180px]">
          <GraphNode x={0} y={0} header="Default">Body content</GraphNode>
          <GraphNode x={0} y={0} header="Selected" variant="selected">Body content</GraphNode>
          <GraphNode x={0} y={0} header="Muted" variant="muted">Body content</GraphNode>
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
      name: "On canvas",
      render: () => (
        <Canvas className="h-64 w-full rounded-ui border border-border">
          <GraphNode x={30} y={20} header="Extract" accent ports={[{ side: "right", state: "connected" }]}>API → Raw</GraphNode>
          <GraphNode x={240} y={20} header="Transform" variant="selected" accent ports={[{ side: "left", state: "connected" }, { side: "right", state: "connected" }]}>Clean + Map</GraphNode>
          <GraphNode x={450} y={20} header="Load" accent ports={[{ side: "left", state: "connected" }]}>DB → Warehouse</GraphNode>
        </Canvas>
      ),
    },
  ],
};
export default entry;
