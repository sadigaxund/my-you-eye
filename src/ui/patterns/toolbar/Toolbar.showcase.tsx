import { useState } from "react";
import type { ShowcaseEntry } from "../../../showcase/types";
import { Toolbar } from ".";
import type { ToolbarFilterChip } from ".";
import { Input } from "../../input";
import { Button } from "../../button";
import { Badge } from "../../badge";

function ToolbarWithChipsDemo() {
  const [chips, setChips] = useState<ToolbarFilterChip[]>([
    { key: "status", label: "Status: Active" },
    { key: "role", label: "Role: Editor" },
    { key: "date", label: "Last 30 days" },
  ]);

  return (
    <div className="w-full max-w-2xl">
      <Toolbar
        leading={<span className="text-sm font-medium text-fg">Orders</span>}
        search={<Input placeholder="Search orders..." size="sm" className="min-w-56" />}
        filters={
          <>
            <Button size="sm" variant="secondary">Status</Button>
            <Button size="sm" variant="secondary">Date</Button>
          </>
        }
        actions={
          <>
            <Button size="sm" variant="secondary">Export</Button>
            <Button size="sm">New order</Button>
          </>
        }
        resultCount={`${128 - chips.length * 12} results`}
        chips={chips}
        onClearAll={() => setChips([])}
      />
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Toolbar",
  group: "patterns",
  description: "A composable app toolbar: leading label, search, filters, and actions up top, with an optional result-count and active-filter-chip row below.",
  demos: [
    {
      name: "All slots filled",
      render: () => (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <Toolbar
              search={<Input placeholder="Search orders..." size="sm" className="min-w-56" />}
              filters={
                <>
                  <Button size="sm" variant="secondary">Status</Button>
                  <Button size="sm" variant="secondary">Date</Button>
                  <Badge variant="primary" style="soft">2 active</Badge>
                </>
              }
              actions={
                <>
                  <Button size="sm" variant="secondary">Export</Button>
                  <Button size="sm">New order</Button>
                </>
              }
            />
          </div>
        </div>
      ),
    },
    {
      name: "With leading label",
      render: () => (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <Toolbar
              leading={<span className="text-sm font-medium text-fg">Team members</span>}
              search={<Input placeholder="Search members..." size="sm" className="min-w-56" />}
              actions={<Button size="sm">Invite</Button>}
            />
          </div>
        </div>
      ),
    },
    {
      name: "Result count + removable filter chips",
      render: () => (
        <div className="flex justify-center">
          <ToolbarWithChipsDemo />
        </div>
      ),
    },
    {
      name: "Narrow / responsive collapse",
      render: () => (
        <div className="flex justify-center">
          <div className="w-72 border border-dashed border-muted/40 rounded-ui p-2 space-y-1">
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-xs text-muted font-mono">320px viewport</span>
              <svg viewBox="0 0 10 14" className="size-3 fill-muted"><rect x="0.5" y="0.5" width="9" height="13" rx="1.5" stroke="currentColor" strokeWidth="0.5" fill="none" /><path d="M3 11h4" stroke="currentColor" strokeWidth="0.5" fill="none" /></svg>
            </div>
            <Toolbar
              search={<Input placeholder="Search files..." size="sm" />}
              filters={
                <Button size="sm" variant="secondary" className="text-xs px-2 gap-1">
                  <svg viewBox="0 0 10 10" className="size-3 fill-current"><path d="M1 2h8v1H1V2zm1 3h6v1H2V5zm1 3h4v1H3V8z" /></svg>
                  Type
                </Button>
              }
              actions={
                <Button size="sm" className="text-xs px-2 gap-1">
                  <svg viewBox="0 0 10 10" className="size-3 fill-current"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
                  New
                </Button>
              }
              resultCount="42 results"
            />
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
