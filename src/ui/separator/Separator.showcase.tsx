import type { ShowcaseEntry } from "../../showcase/types";
import { Separator } from ".";

const entry: ShowcaseEntry = {
  title: "Separator",
  group: "display",
  demos: [
    {
      name: "Horizontal",
      render: () => (
        <div className="flex flex-col gap-2 max-w-xs">
          <p className="text-sm">Above</p>
          <Separator />
          <p className="text-sm">Below</p>
        </div>
      ),
    },
    {
      name: "Vertical",
      render: () => (
        <div className="flex items-center gap-3 h-10">
          <span className="text-sm">Left</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Center</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Right</span>
        </div>
      ),
    },
  ],
};
export default entry;
