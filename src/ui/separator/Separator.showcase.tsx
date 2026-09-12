import type { ShowcaseEntry } from "../../showcase/types";
import { Separator } from ".";

const entry: ShowcaseEntry = {
  title: "Separator",
  group: "display",
  demos: [
    {
      name: "Horizontal",
      render: () => (
        <div className="flex flex-col gap-2 max-w-xs mx-auto">
          <p className="text-sm text-center">Above</p>
          <Separator />
          <p className="text-sm text-center">Below</p>
        </div>
      ),
    },
    {
      name: "Vertical",
      render: () => (
        <div className="flex items-center justify-center gap-3 h-10">
          <span className="text-sm">Left</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Center</span>
          <Separator orientation="vertical" />
          <span className="text-sm">Right</span>
        </div>
      ),
    },
    {
      name: "Border tiers",
      description: "Structural --color-border vs the nested --color-border-subtle tier for dividers inside a bordered box.",
      render: () => (
        <div className="flex items-start justify-center gap-6">
          <div className="w-56 rounded-ui border border-border text-sm">
            <div className="border-b border-border-subtle px-3 py-2">Editor</div>
            <div className="border-b border-border-subtle px-3 py-2">Git &amp; sync</div>
            <div className="px-3 py-2">Sharing</div>
          </div>
          <div className="flex w-56 flex-col gap-2 text-sm">
            <p>Above</p>
            <Separator />
            <p>Below</p>
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
