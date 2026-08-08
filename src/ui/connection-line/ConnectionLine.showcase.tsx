import type { ShowcaseEntry } from "../../showcase/types";
import { ConnectionLine } from ".";
import { ConnectionLayer } from "../connection-layer";
import { Edge } from "../canvas";

const entry: ShowcaseEntry = {
  title: "ConnectionLine",
  group: "canvas",
  demos: [
    {
      name: "Path variants",
      render: () => (
        <div className="flex flex-col items-center gap-6 py-4 h-[344px]">
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
      description: "labelPosition evaluates the actual rendered curve (closed-form cubic for bezier, walked polyline for stepped) instead of a straight-line lerp between endpoints — so the badge sits on the line at every position, not just at flat/degenerate edges.",
      render: () => (
        <div className="flex flex-col items-center gap-6 py-4 h-auto">
          <div className="relative" style={{ width: 300, height: 90 }}>
            <ConnectionLine from={{ x: 10, y: 10 }} to={{ x: 290, y: 80 }} variant="bezier" state="connected" arrowhead label="25%" labelPosition={25} />
            <ConnectionLine from={{ x: 10, y: 10 }} to={{ x: 290, y: 80 }} variant="bezier" state="pending" label="50%" labelPosition={50} />
            <ConnectionLine from={{ x: 10, y: 10 }} to={{ x: 290, y: 80 }} variant="bezier" state="pending" label="75%" labelPosition={75} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">bezier, non-flat</span>
          </div>
          <div className="relative" style={{ width: 300, height: 90 }}>
            <ConnectionLine from={{ x: 10, y: 10 }} to={{ x: 290, y: 80 }} variant="stepped" state="connected" arrowhead label="elbow" labelPosition={50} />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">stepped, label at the elbow</span>
          </div>
          <div className="relative" style={{ width: 300, height: 60 }}>
            <ConnectionLine from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }} variant="bezier" state="connected" label="非ASCIIラベル 🎯" />
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">non-ASCII / wide-glyph label (measured, not guessed)</span>
          </div>
        </div>
      ),
    },
    {
      name: "ConnectionLayer (one svg, many edges)",
      description: "Renders N edges — path, arrowhead and label — inside a single shared <svg>, sharing the exact same path/arrow-angle math as ConnectionLine (ConnectionPath) instead of duplicating it. Use this over stacking N standalone ConnectionLines for diagrams with many edges.",
      render: () => (
        <div className="relative" style={{ width: 320, height: 160 }}>
          <ConnectionLayer
            edges={[
              { id: "a", from: { x: 10, y: 20 }, to: { x: 310, y: 20 }, variant: "straight", state: "connected", arrowhead: true, label: "sync" },
              { id: "b", from: { x: 10, y: 60 }, to: { x: 310, y: 110 }, variant: "bezier", state: "highlighted", arrowhead: true, label: "async" },
              { id: "c", from: { x: 10, y: 140 }, to: { x: 310, y: 90 }, variant: "stepped", state: "pending", arrowhead: true, label: "retry" },
            ]}
          />
        </div>
      ),
    },
  ],
};
export default entry;
