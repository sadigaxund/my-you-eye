import type { ShowcaseEntry } from "../../showcase/types";
import { Textarea } from ".";

const entry: ShowcaseEntry = {
  title: "Textarea",
  group: "inputs",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs">
          <Textarea placeholder="Default variant" />
          <Textarea variant="filled" placeholder="Filled variant" />
        </div>
      ),
    },
    {
      name: "States",
      render: () => (
        <div className="flex flex-col gap-3 max-w-xs">
          <Textarea disabled value="Disabled" />
          <Textarea invalid placeholder="Invalid state" />
          <Textarea autoResize placeholder="Auto-resize — type here..." />
        </div>
      ),
    },
  ],
};
export default entry;
