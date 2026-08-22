import type { ShowcaseEntry } from "../../showcase/types";
import { DiffStatChip } from ".";
import { Kbd } from "../kbd";

const entry: ShowcaseEntry = {
  title: "DiffStatChip",
  group: "display",
  description:
    "Two-tone added/removed line counts for pane headers and status bars. No pill chrome — lighter than a Badge by design.",
  demos: [
    {
      name: "Sizes",
      render: () => (
        <div className="flex items-center justify-center gap-6">
          <DiffStatChip added={12} removed={5} size="sm" />
          <DiffStatChip added={128} removed={41} size="md" />
        </div>
      ),
    },
    {
      name: "In context",
      description:
        "The typical placement: inline after a filename, quiet enough not to fight real badges.",
      render: () => (
        <div className="flex flex-col items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-mono">
            src/ui/select/Select.tsx <DiffStatChip added={24} removed={8} />
          </span>
          <span className="flex items-center gap-2 text-sm font-mono">
            README.md <DiffStatChip added={2} removed={0} /> <Kbd>M</Kbd>
          </span>
        </div>
      ),
    },
  ],
};
export default entry;
