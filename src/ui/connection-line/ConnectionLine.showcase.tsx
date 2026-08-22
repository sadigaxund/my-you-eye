import type { ShowcaseEntry } from "../../showcase/types";
import { ConnectionLine } from ".";
import { ConnectionLayer } from "../connection-layer";
import { Edge } from "../canvas";
import { anchoringDemos } from "./ConnectionLine.anchoring";

const entry: ShowcaseEntry = {
  title: "ConnectionLine",
  group: "canvas",
  demos: [
    {
      name: "Path variants",
      description: "orthogonal is real right-angle routing rather than stepped's naive mid-X elbow; see \"Orthogonal routing avoids obstacles\" below for what that buys you.",
      render: () => (
        <div className="flex flex-col items-center gap-6 py-4 h-[420px]">
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 50 }} to={{ x: 290, y: 10 }} variant="bezier" state="connected" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">bezier</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 50 }} to={{ x: 290, y: 10 }} variant="stepped" state="connected" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">stepped</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 10 }} to={{ x: 290, y: 50 }} variant="straight" state="connected" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">straight</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 50 }} to={{ x: 290, y: 10 }} variant="orthogonal" state="connected" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">orthogonal</span>
          </div>
        </div>
      ),
    },
    {
      name: "Edge states",
      render: () => (
        <div className="flex flex-col items-center gap-6 py-4 h-[344px]">
          {(["default", "connected", "highlighted", "pending"] as const).map((state) => (
            <div key={state} className="relative" style={{ width: 300, height: 60 }}>
              <svg width={300} height={60} className="overflow-visible">
                <Edge from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} state={state} />
              </svg>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">{state}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Decorations (arrowheads + labels)",
      render: () => (
        <div className="flex flex-col items-center gap-6 py-4 h-auto">
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="connected" arrowhead />
            <span className="absolute -bottom-1 right-0 text-xs text-muted">arrowhead</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="connected" label="HTTP" />
            <span className="absolute -bottom-1 right-0 text-xs text-muted">label</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="connected" arrowhead label="RPC" />
            <span className="absolute -bottom-1 right-0 text-xs text-muted">both</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="pending" arrowhead />
            <span className="absolute -bottom-1 right-0 text-xs text-muted">dashed + arrowhead</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="highlighted" arrowhead label="sync" />
            <span className="absolute -bottom-1 right-0 text-xs text-muted">highlighted + both</span>
          </div>
        </div>
      ),
    },
    {
      name: "Label positions",
      render: () => (
        <div className="flex flex-col items-center gap-6 py-4 h-auto">
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="connected" arrowhead label="25%" labelPosition={25} />
            <span className="absolute -bottom-1 right-0 text-xs text-muted">label at 25%</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="connected" arrowhead label="center" labelPosition={50} />
            <span className="absolute -bottom-1 right-0 text-xs text-muted">label at 50% (default)</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="connected" arrowhead label="75%" labelPosition={75} />
            <span className="absolute -bottom-1 right-0 text-xs text-muted">label at 75%</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="connected" arrowhead label="flat" labelElevated={false} />
            <span className="absolute -bottom-1 right-0 text-xs text-muted">no elevation</span>
          </div>
        </div>
      ),
    },
    {
      name: "Label on a genuinely curved path",
      description: "labelPosition evaluates the actual rendered curve (a closed-form cubic for bezier, a walked polyline for stepped) instead of lerping along a straight line between the endpoints, so the badge sits on the line at every position. The edge's own stroke is gapped underneath the label, which keeps it legible on every theme.",
      render: () => (
        <div className="flex flex-col items-center gap-10 py-4 h-auto">
          <div className="relative" style={{ width: 300, height: 110 }}>
            {/* Three labels on the SAME curve — rendered via ConnectionLayer
                (not 3 stacked standalone ConnectionLines) so every label
                paints above every edge's stroke, including the other two
                labelled instances of this identical curve. */}
            <ConnectionLayer
              edges={[
                { id: "25", from: { x: 10, y: 10 }, to: { x: 290, y: 80 }, variant: "bezier", state: "connected", arrowhead: true, label: "25%", labelPosition: 25 },
                { id: "50", from: { x: 10, y: 10 }, to: { x: 290, y: 80 }, variant: "bezier", state: "pending", label: "50%", labelPosition: 50 },
                { id: "75", from: { x: 10, y: 10 }, to: { x: 290, y: 80 }, variant: "bezier", state: "pending", label: "75%", labelPosition: 75 },
              ]}
            />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted">bezier, non-flat</span>
          </div>
          <div className="relative" style={{ width: 300, height: 110 }}>
            <ConnectionLine from={{ x: 10, y: 10 }} to={{ x: 290, y: 80 }} variant="stepped" state="connected" arrowhead label="elbow" labelPosition={50} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted">stepped, label at the elbow</span>
          </div>
          <div className="relative" style={{ width: 300, height: 80 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="connected" label="非ASCIIラベル 🎯" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted">non-ASCII / wide-glyph label (measured, not guessed)</span>
          </div>
        </div>
      ),
    },
    {
      name: "ConnectionLayer (one svg, many edges)",
      description: "Renders N edges with their paths, arrowheads and labels inside one shared <svg>, on the same ConnectionPath math as ConnectionLine. Each edge gets its own y-range lane, so the routes never cross; see AGENTS.md TODO A4.",
      render: () => (
        <div className="relative" style={{ width: 320, height: 160 }}>
          <ConnectionLayer
            edges={[
              { id: "a", from: { x: 10, y: 20 }, to: { x: 310, y: 20 }, variant: "straight", state: "connected", arrowhead: true, label: "sync" },
              { id: "b", from: { x: 10, y: 65 }, to: { x: 310, y: 85 }, variant: "bezier", state: "highlighted", arrowhead: true, label: "async" },
              { id: "c", from: { x: 10, y: 130 }, to: { x: 310, y: 145 }, variant: "stepped", state: "pending", arrowhead: true, label: "retry" },
            ]}
          />
        </div>
      ),
    },
    ...anchoringDemos,
    {
      name: "Orthogonal routing avoids obstacles",
      description: "variant=\"orthogonal\" is real right-angle routing: given a list of obstacle rects it detours around them, while stepped's naive mid-X elbow (top row) cuts straight through whatever sits in the middle.",
      render: () => {
        const obstacle = { x: 120, y: 10, width: 80, height: 80 };
        const box = <div className="absolute rounded-ui-sm border border-dashed border-danger/50 bg-danger/5" style={{ left: obstacle.x, top: obstacle.y, width: obstacle.width, height: obstacle.height }} />;
        return (
          <div className="flex flex-col items-center gap-6 py-4 h-auto">
            <div className="relative" style={{ width: 320, height: 100 }}>
              {box}
              <ConnectionLine from={{ x: 10, y: 50 }} to={{ x: 310, y: 50 }} variant="stepped" state="pending" arrowhead />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">stepped — cuts straight through the node</span>
            </div>
            <div className="relative" style={{ width: 320, height: 100 }}>
              {box}
              <ConnectionLine from={{ x: 10, y: 50 }} to={{ x: 310, y: 50 }} variant="orthogonal" state="connected" arrowhead obstacles={[obstacle]} />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">orthogonal + obstacles — routes around it</span>
            </div>
          </div>
        );
      },
    },
    {
      name: "Waypoints",
      description: "waypoints pins an explicit route through one or more intermediate points, and it works with every variant rather than only orthogonal.",
      render: () => (
        <div className="flex flex-col items-center gap-6 py-4 h-auto">
          <div className="relative" style={{ width: 320, height: 120 }}>
            <ConnectionLine from={{ x: 10, y: 100 }} to={{ x: 310, y: 20 }} variant="orthogonal" state="connected" arrowhead waypoints={[{ x: 160, y: 100 }, { x: 160, y: 20 }]} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">orthogonal, pinned via 2 waypoints</span>
          </div>
          <div className="relative" style={{ width: 320, height: 120 }}>
            <ConnectionLine from={{ x: 10, y: 100 }} to={{ x: 310, y: 20 }} variant="bezier" state="connected" arrowhead label="via" waypoints={[{ x: 160, y: 10 }]} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">bezier, routed through one waypoint</span>
          </div>
        </div>
      ),
    },
    {
      name: "Edge kind (semantic styling)",
      description: "kind names what an edge is (a sync call, a fire-and-forget async call, a data flow, an error path), independent of interaction state. It is the styling a diagram should default to, so edges of different meaning stop looking alike.",
      render: () => (
        <div className="flex flex-col items-center gap-4 py-4 h-auto">
          {(["sync", "async", "data", "error"] as const).map((kind) => (
            <div key={kind} className="relative" style={{ width: 300, height: 40 }}>
              <ConnectionLine from={{ x: 10, y: 20 }} to={{ x: 290, y: 20 }} variant="straight" kind={kind} arrowhead label={kind} />
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Draw-on progress",
      description: "progress (0→1, default 1) truncates the stroke to a real geometric prefix of the route, which is how DiagramScene's \"connect\" step draws an edge on over its own step duration. The label and arrowhead stay hidden until the edge completes, since an arrowhead pointing at empty air reads as broken.",
      render: () => (
        <div className="flex flex-col items-center gap-6 py-4 h-auto">
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 50 }} to={{ x: 290, y: 10 }} variant="bezier" kind="data" arrowhead label="progress=0.35" progress={0.35} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">progress=0.35 — no label/arrowhead yet</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 50 }} to={{ x: 290, y: 10 }} variant="orthogonal" kind="sync" arrowhead label="progress=0.7" progress={0.7} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">progress=0.7, orthogonal</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 50 }} to={{ x: 290, y: 10 }} variant="bezier" kind="data" arrowhead label="done" progress={1} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">progress=1 (default) — fully drawn, label + arrowhead on</span>
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
