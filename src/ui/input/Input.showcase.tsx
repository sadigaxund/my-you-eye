import type { ShowcaseEntry } from "../../showcase/types";
import { Input } from ".";

const entry: ShowcaseEntry = {
  title: "Input",
  group: "inputs",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs">
          <Input placeholder="Default variant" />
          <Input variant="filled" placeholder="Filled variant" />
        </div>
      ),
    },
    {
      name: "Sizes",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs">
          <Input size="sm" placeholder="Small" />
          <Input size="md" placeholder="Medium" />
        </div>
      ),
    },
    {
      name: "States",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs">
          <Input disabled value="Disabled" />
          <Input invalid placeholder="Invalid state" />
        </div>
      ),
    },
  ],
};
export default entry;
