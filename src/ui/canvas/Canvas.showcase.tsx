import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas, Edge } from ".";
import { Port } from "../port";

const entry: ShowcaseEntry = {
  title: "Canvas",
  group: "canvas",
  demos: [
    {
      name: "Empty grid",
      render: () => <Canvas className="h-64 w-full rounded-ui border border-border" />,
    },
    {
      name: "Ports on grid",
      render: () => (
        <div className="flex justify-center gap-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <Port state="default" />
            <span className="text-xs text-muted">default</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Port state="connected" />
            <span className="text-xs text-muted">connected</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Port state="highlighted" />
            <span className="text-xs text-muted">highlighted</span>
          </div>
        </div>
      ),
    },
    {
      name: "Edge states",
      render: () => (
        <div className="flex flex-col items-center gap-6 py-4">
          {(["default", "selected", "animated"] as const).map((state) => (
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
      name: "Edge clickable hit area",
      render: () => (
        <div className="flex justify-center py-4">
          <div className="relative" style={{ width: 300, height: 60 }}>
            <svg width={300} height={60} className="overflow-visible">
              <Edge from={{ x: 10, y: 30 }} to={{ x: 290, y: 30 }}
                onClick={() => alert("Edge clicked")} onContextMenu={(e) => { e.preventDefault(); alert("Edge context menu"); }} />
            </svg>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-muted">Click or right-click the path</span>
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
