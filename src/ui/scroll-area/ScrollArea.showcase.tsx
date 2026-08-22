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
      name: "Both axes",
      description: "The default orientation: overflow-auto on both axes, for content wider and taller than its box.",
      render: () => (
        <ScrollArea orientation="both" className="h-48 rounded-ui border border-border">
          <div className="w-[900px] p-3 space-y-2">
            <p className="text-sm font-medium text-fg">Query plan — orders_daily</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">Seq Scan on orders  (cost=0.00..18334.00 rows=1000000 width=68) (actual time=0.011..84.221 rows=1000000 loops=1)</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">  Filter: ((status = 'shipped'::text) AND (created_at &gt;= '2026-01-01'::date))</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">  Rows Removed by Filter: 412903</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">HashAggregate  (cost=21334.00..21384.00 rows=5000 width=40) (actual time=210.884..211.902 rows=4812 loops=1)</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">  Group Key: date_trunc('day'::text, created_at), region_id</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">  Batches: 1  Memory Usage: 913kB</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">Sort  (cost=21384.00..21396.50 rows=5000 width=40) (actual time=213.004..213.310 rows=4812 loops=1)</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">  Sort Key: (date_trunc('day'::text, created_at)) DESC</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">  Sort Method: quicksort  Memory: 611kB</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">Planning Time: 0.284 ms</p>
            <p className="whitespace-nowrap font-mono text-xs text-muted">Execution Time: 214.771 ms</p>
          </div>
        </ScrollArea>
      ),
    },
    {
      name: "Rounded corners (radius on ScrollArea itself, not a wrapper)",
      description: "Putting rounded-ui and the border directly on ScrollArea, rather than on a separate overflow-hidden wrapper div, keeps the scrollbar's clip in sync with the border radius so it never overlaps the corner.",
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
