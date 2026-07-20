import type { ShowcaseEntry } from "../../showcase/types";
import { ConnectionLine } from ".";
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
  ],
};
export default entry;
