import type { ShowcaseEntry } from "../../showcase/types";
import { Checkbox } from ".";

const entry: ShowcaseEntry = {
  title: "Checkbox",
  group: "inputs",
  demos: [
    {
      name: "Sizes",
      render: () => (
        <div className="flex items-center justify-center gap-4">
          <label className="flex items-center gap-2">
            <Checkbox size="sm" /> <span className="text-sm">Small</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox size="md" /> <span className="text-sm">Medium</span>
          </label>
        </div>
      ),
    },
    {
      name: "States",
      render: () => (
        <div className="flex flex-col gap-3 items-start w-max mx-auto">
          <label className="flex items-center gap-2">
            <Checkbox defaultChecked /> <span className="text-sm">Checked</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox /> <span className="text-sm">Unchecked</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox disabled /> <span className="text-sm">Disabled</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox disabled defaultChecked /> <span className="text-sm">Disabled checked</span>
          </label>
        </div>
      ),
    },
  ],
};
export default entry;
