import type { ShowcaseEntry } from "../../showcase/types";
import { Kbd } from ".";

const entry: ShowcaseEntry = {
  title: "Kbd",
  group: "display",
  demos: [
    {
      name: "Default",
      render: () => (
        <div className="flex items-center gap-2">
          <span className="text-sm">Save</span>
          <Kbd>⌘</Kbd><Kbd>S</Kbd>
        </div>
      ),
    },
    {
      name: "Combinations",
      render: () => (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1 text-sm">
            <span>Find:</span> <Kbd>⌘</Kbd> + <Kbd>K</Kbd>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <span>Search:</span> <Kbd>⌃</Kbd> + <Kbd>⇧</Kbd> + <Kbd>F</Kbd>
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
