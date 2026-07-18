import type { ShowcaseEntry } from "../../showcase/types";
import { Canvas, Edge } from ".";

const entry: ShowcaseEntry = {
  title: "Canvas",
  group: "canvas",
  description: "An infinite pan/zoom surface with a GPU-composited grid background, used as the base layer for node graphs.",
  demos: [
    {
      name: "Empty grid",
      render: () => <Canvas className="h-[344px] w-full rounded-ui border border-border" />,
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
  ],
};
export default entry;
