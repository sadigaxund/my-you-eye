import type { ShowcaseEntry } from "../../showcase/types";
import { Input } from ".";

const entry: ShowcaseEntry = {
  title: "Input",
  group: "inputs",
  description: "A single-line text field with default and filled variants, two sizes, and an invalid state for validation errors.",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Input placeholder="Default variant" />
          <Input variant="filled" placeholder="Filled variant" />
        </div>
      ),
    },
    {
      name: "Sizes",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Input size="sm" placeholder="Small" />
          <Input size="md" placeholder="Medium" />
        </div>
      ),
    },
    {
      name: "States",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Input disabled value="Disabled" />
          <Input invalid placeholder="Invalid state" />
        </div>
      ),
    },
  ],
};
export default entry;
