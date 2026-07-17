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
      name: "Sides",
      render: () => (
        <div className="flex flex-col gap-4">
          <Port side="in" label="Input" />
          <Port side="out" label="Output" />
        </div>
      ),
    },
    {
      name: "Row-aligned ports (two same side)",
      render: () => (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 border border-border rounded-ui p-3">
            <Port side="in" state="connected" />
            <span className="text-xs text-muted">field_one</span>
            <div className="flex-1" />
            <Port side="out" state="connected" />
          </div>
          <div className="flex items-center gap-4 border border-border rounded-ui p-3">
            <Port side="in" state="default" />
            <span className="text-xs text-muted">field_two</span>
            <div className="flex-1" />
            <Port side="out" state="default" />
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
