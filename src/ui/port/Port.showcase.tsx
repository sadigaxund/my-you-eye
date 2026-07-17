import type { ShowcaseEntry } from "../../showcase/types";
import { Port } from ".";

const entry: ShowcaseEntry = {
  title: "Port",
  group: "canvas",
  demos: [
    {
      name: "States",
      render: () => (
        <div className="flex justify-center gap-6">
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
      name: "On node border",
      render: () => (
        <div className="flex justify-center gap-6">
          <div className="relative border border-border rounded-ui bg-bg shadow-card" style={{ width: 180, height: 32 }}>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Port side="in" state="connected" />
            </div>
            <div className="flex items-center justify-center h-full px-3 text-xs text-muted">
              row with ports
            </div>
          </div>
          <div className="relative border border-border rounded-ui bg-bg shadow-card" style={{ width: 180, height: 32 }}>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
              <Port side="out" state="default" />
            </div>
            <div className="flex items-center justify-center h-full px-3 text-xs text-muted">
              right port only
            </div>
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
