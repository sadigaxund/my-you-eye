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
        <ScrollArea orientation="horizontal" className="border border-border rounded-ui">
          <div className="flex gap-3 p-3 w-[800px]">
            {items.slice(0, 20).map((name) => (
              <div key={name} className="shrink-0 w-32 h-20 flex items-center justify-center rounded-ui bg-secondary text-sm text-fg">{name}</div>
            ))}
          </div>
        </ScrollArea>
      ),
    },
    {
      name: "Rounded corners (radius on ScrollArea itself, not a wrapper)",
      description: "Applying rounded-ui + border directly to ScrollArea — not to a separate overflow-hidden wrapper div — keeps the scrollbar's clip in sync with the border-radius so it never overlaps the corner.",
      render: () => (
        <ScrollArea className="h-40 rounded-ui border border-border">
          <div className="p-3 space-y-2">
            {items.map((name) => (
              <div key={name} className="text-sm text-fg py-1 border-b border-border/50 last:border-b-0">{name}</div>
            ))}
          </div>
        </ScrollArea>
      ),
    },
    {
      name: "Edge fade",
      description: "fade adds a token-sized CSS-mask fade at the scrollable edge(s) so the region reads as scrollable before it's touched.",
      render: () => (
        <div className="flex flex-col gap-4">
          <ScrollArea fade orientation="vertical" className="h-32 rounded-ui border border-border">
            <div className="p-3 space-y-2">
              {items.map((name) => (
                <div key={name} className="text-sm text-fg py-1">{name}</div>
              ))}
            </div>
          </ScrollArea>
          <ScrollArea fade orientation="horizontal" className="rounded-ui border border-border">
            <div className="flex gap-3 p-3 w-[800px]">
              {items.slice(0, 20).map((name) => (
                <div key={name} className="shrink-0 w-32 h-16 flex items-center justify-center rounded-ui bg-secondary text-sm text-fg">{name}</div>
              ))}
            </div>
          </ScrollArea>
        </div>
      ),
    },
  ],
};
export default entry;
