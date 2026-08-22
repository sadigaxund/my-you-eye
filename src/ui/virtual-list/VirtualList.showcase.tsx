import { useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { VirtualList } from ".";

const ROWS = 10000;
const allRows = Array.from({ length: ROWS }, (_, i) => ({
  id: `row-${i}`,
  name: `note-${String(i + 1).padStart(4, "0")}.md`,
}));

function TenThousandRowsDemo() {
  const [lastClicked, setLastClicked] = useState("");
  return (
    <div className="flex flex-col gap-2 mx-auto max-w-sm">
      <VirtualList
        items={allRows}
        rowHeight={28}
        className="h-64 rounded-ui border border-border"
        aria-label="Virtualized note list"
        getKey={(item) => item.id}
        renderRow={(item, index) => (
          <button
            type="button"
            onClick={() => setLastClicked(item.name)}
            className={
              "flex h-full w-full items-center gap-2 px-3 text-left text-xs font-mono hover:bg-surface-hover" +
              (lastClicked === item.name ? " bg-primary/15" : "")
            }
          >
            <span className="text-muted w-12 shrink-0 text-right">{index + 1}</span>
            {item.name}
          </button>
        )}
      />
      <p className="text-xs text-muted text-center">
        10,000 rows, fixed 28px height — only ~20 are mounted. Last clicked: {lastClicked || "none"}
      </p>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "VirtualList",
  group: "display",
  description:
    "Fixed-row-height windowed list on ScrollArea — mounts only the visible window plus overscan, so scrollbar and keyboard model stay honest at any item count.",
  demos: [
    {
      name: "10,000 rows",
      description:
        "rowHeight is required — the caller reads it off its own layout tokens rather than letting the component guess. Windowing math is exported as computeVirtualWindow for DOM-free unit testing.",
      render: () => <TenThousandRowsDemo />,
    },
  ],
};
export default entry;
