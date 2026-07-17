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
  ],
};
export default entry;
