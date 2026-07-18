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
          <div className="w-64 border border-dashed border-border p-2">
            <Toolbar
              leading={<span className="text-sm font-medium text-fg">Files</span>}
              search={<Input placeholder="Search..." size="sm" />}
              filters={<Button size="sm" variant="secondary">Type</Button>}
              actions={<Button size="sm">Upload</Button>}
              resultCount="42 results"
              chips={[{ key: "type", label: "Type: PDF" }]}
            />
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
