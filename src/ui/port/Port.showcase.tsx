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
  ],
};
export default entry;
