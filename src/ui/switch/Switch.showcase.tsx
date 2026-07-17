import type { ShowcaseEntry } from "../../showcase/types";
import { Switch } from ".";

const entry: ShowcaseEntry = {
  title: "Switch",
  group: "inputs",
  demos: [
    {
      name: "Sizes",
      render: () => (
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <Switch size="sm" /> <span className="text-sm">Small</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch size="md" /> <span className="text-sm">Medium</span>
          </label>
        </div>
      ),
    },
    {
      name: "States",
      render: () => (
        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2">
            <Switch /> <span className="text-sm">Off</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch defaultChecked /> <span className="text-sm">On</span>
          </label>
          <label className="flex items-center gap-2">
            <Switch disabled /> <span className="text-sm">Disabled</span>
          </label>
        </div>
      ),
    },
  ],
};
export default entry;
