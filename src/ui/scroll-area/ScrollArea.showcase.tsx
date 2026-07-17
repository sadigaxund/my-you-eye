import type { ShowcaseEntry } from "../../showcase/types";
import { ScrollArea } from ".";

const items = Array.from({ length: 40 }, (_, i) => `Item ${i + 1}`);

const entry: ShowcaseEntry = {
  title: "ScrollArea",
  group: "display",
  demos: [
    {
      name: "Vertical scroll",
      render: () => (
        <ScrollArea className="h-48 border border-border rounded-ui">
          <div className="p-3 space-y-2">
            {items.map((name) => (
              <div key={name} className="text-sm text-fg py-1 border-b border-border/50 last:border-b-0">{name}</div>
            ))}
          </div>
        </ScrollArea>
      ),
    },
    {
      name: "Horizontal scroll",
      render: () => (
        <ScrollArea className="border border-border rounded-ui">
          <div className="flex gap-3 p-3 w-[800px]">
            {items.slice(0, 20).map((name) => (
              <div key={name} className="shrink-0 w-32 h-20 flex items-center justify-center rounded-ui bg-secondary text-sm text-fg">{name}</div>
            ))}
          </div>
        </ScrollArea>
      ),
    },
  ],
};
export default entry;
