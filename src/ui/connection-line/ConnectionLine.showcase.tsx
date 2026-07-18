import type { ShowcaseEntry } from "../../showcase/types";
import { ConnectionLine } from ".";

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
  ],
};
export default entry;
