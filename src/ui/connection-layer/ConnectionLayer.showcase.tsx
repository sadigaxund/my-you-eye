import type { ShowcaseEntry } from "../../showcase/types";
import { ConnectionLayer } from ".";

const entry: ShowcaseEntry = {
  title: "ConnectionLayer",
  group: "canvas",
  description: "One shared <svg> for N edges, with path, arrowhead and label rendering reused from ConnectionLine's ConnectionPath. Prefer it over stacking many standalone ConnectionLines when a diagram has a lot of edges.",
  demos: [
    {
      name: "Many edges, one svg",
      description: "A small architecture diagram that is routed rather than hand-tuned: every forward edge is variant=\"orthogonal\" with the other nodes passed as obstacles, so it detours around them, and the backward \"retry\" edge (worker → api) uses explicit waypoints to loop underneath the whole diagram. No edge crosses another, and that was checked geometrically rather than by eye.",
      render: () => {
        const api = { x: 20, y: 90, width: 80, height: 40 };
        const queue = { x: 190, y: 20, width: 80, height: 40 };
        const cache = { x: 190, y: 160, width: 80, height: 40 };
        const worker = { x: 360, y: 90, width: 80, height: 40 };
        const nodeBoxClass = "absolute flex items-center justify-center rounded-ui-sm border border-border bg-surface text-xs font-medium text-fg";
        const boxStyle = (r: typeof api) => ({ left: r.x, top: r.y, width: r.width, height: r.height });
        return (
          <div className="relative" style={{ width: 460, height: 260 }}>
            <div className={nodeBoxClass} style={boxStyle(api)}>api</div>
            <div className={nodeBoxClass} style={boxStyle(queue)}>queue</div>
            <div className={nodeBoxClass} style={boxStyle(cache)}>cache</div>
            <div className={nodeBoxClass} style={boxStyle(worker)}>worker</div>
            <ConnectionLayer
              edges={[
                { id: "sync", from: { x: 100, y: 100 }, to: { x: 190, y: 40 }, variant: "orthogonal", kind: "sync", arrowhead: true, label: "sync", obstacles: [cache, worker] },
                { id: "data", from: { x: 100, y: 120 }, to: { x: 190, y: 180 }, variant: "orthogonal", kind: "data", arrowhead: true, label: "data", obstacles: [queue, worker] },
                { id: "async", from: { x: 270, y: 40 }, to: { x: 360, y: 100 }, variant: "orthogonal", kind: "async", arrowhead: true, label: "async", obstacles: [api, cache] },
                { id: "retry", from: { x: 400, y: 130 }, to: { x: 60, y: 130 }, variant: "straight", kind: "error", arrowhead: true, label: "retry", waypoints: [{ x: 400, y: 220 }, { x: 60, y: 220 }] },
              ]}
            />
          </div>
        );
      },
    },
    {
      name: "Parallel edges (automatic bundling)",
      description: "Three edges between the same two points would overlap into one indistinguishable stroke, so ConnectionLayer spots the shared endpoint pair and fans them out itself (bundleParallelEdges, on by default), which saves the call site any offset math.",
      render: () => (
        <div className="relative" style={{ width: 320, height: 100 }}>
          <ConnectionLayer
            edges={[
              { id: "req", from: { x: 20, y: 50 }, to: { x: 300, y: 50 }, variant: "straight", state: "connected", arrowhead: true, label: "request" },
              { id: "retry-1", from: { x: 20, y: 50 }, to: { x: 300, y: 50 }, variant: "straight", state: "pending", arrowhead: true, label: "retry 1" },
              { id: "retry-2", from: { x: 20, y: 50 }, to: { x: 300, y: 50 }, variant: "straight", state: "pending", arrowhead: true, label: "retry 2" },
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
