import type { ShowcaseEntry } from "../../showcase/types";
import { Label } from ".";

const entry: ShowcaseEntry = {
  title: "Label",
  group: "inputs",
  demos: [
    {
      name: "Default",
      render: () => (
        <div className="flex flex-col gap-2 max-w-xs">
          <Label htmlFor="email">Email address</Label>
          <input
            id="email"
            className="flex h-10 w-full rounded-ui border border-border bg-bg px-3 py-2 text-sm"
            placeholder="you@example.com"
          />
        </div>
      ),
    },
  ],
};
export default entry;
