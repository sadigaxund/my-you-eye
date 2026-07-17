import type { ShowcaseEntry } from "../../showcase/types";
import { Port } from ".";

const entry: ShowcaseEntry = {
  title: "Port",
  group: "canvas",
  demos: [
    {
      name: "States",
      render: () => (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <Port state="default" label="default" />
            <Port state="connected" label="connected" />
            <Port state="highlighted" label="highlighted" />
          </div>
        </div>
      ),
    },
    {
      name: "Sides on node border",
      render: () => (
        <div className="flex flex-col gap-6">
          <div className="relative border border-border rounded-ui bg-bg shadow-card" style={{ width: 200, height: 32 }}>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Port side="in" state="connected" />
            </div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
              <Port side="out" state="connected" />
            </div>
            <div className="flex items-center justify-center h-full px-3 text-xs text-muted">
              Node row with ports
            </div>
          </div>
          <div className="relative border border-border rounded-ui bg-bg shadow-card" style={{ width: 200, height: 32 }}>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Port side="in" state="default" />
            </div>
            <div className="flex items-center justify-center h-full px-3 text-xs text-muted">
              Input only
            </div>
          </div>
        </div>
      ),
    },
    {
      name: "Row-aligned on node rows",
      render: () => (
        <div className="relative border border-border rounded-ui bg-bg shadow-card" style={{ width: 260 }}>
          <div className="px-3 py-2 border-b border-border text-xs font-semibold text-fg">
            customer_orders
          </div>
          <div className="divide-y divide-border/50">
            <div className="relative" style={{ height: 32 }}>
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Port side="in" state="connected" />
              </div>
              <div className="flex items-center h-full px-3 text-xs">
                <span className="text-muted truncate">Status</span>
                <span className="text-fg text-right flex-1 ml-3">running</span>
              </div>
            </div>
            <div className="relative" style={{ height: 32 }}>
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                <Port side="out" state="connected" />
              </div>
              <div className="flex items-center h-full px-3 text-xs">
                <span className="text-muted truncate">Rows</span>
                <span className="text-fg text-right flex-1 ml-3">1,234,567</span>
              </div>
            </div>
            <div className="relative" style={{ height: 32 }}>
              <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Port side="in" state="connected" />
              </div>
              <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2">
                <Port side="out" state="default" />
              </div>
              <div className="flex items-center h-full px-3 text-xs">
                <span className="text-muted truncate">Duration</span>
                <span className="text-fg text-right flex-1 ml-3">3.2s</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
