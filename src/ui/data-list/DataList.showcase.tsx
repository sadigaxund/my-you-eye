import type { ShowcaseEntry } from "../../showcase/types";
import { DataList } from ".";

const items = [
  { label: "Name", value: "John Doe", type: "text" as const },
  { label: "Email", value: "john@example.com", type: "email" as const },
  { label: "Active", value: true, type: "boolean" as const },
  { label: "Role", value: "Admin", type: "badge" as const, badgeVariant: "primary" as const },
  { label: "Status", value: "Online", type: "badge" as const, badgeVariant: "success" as const },
  { label: "Website", value: "https://example.com/john", type: "url" as const, replacements: [{ pattern: "john", label: "..." }] },
];

const manyItems = Array.from({ length: 20 }, (_, i) => ({
  label: `Property ${i + 1}`,
  value: `Value ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. Ut enim ad minim`,
  type: "text" as const,
}));

const entry: ShowcaseEntry = {
  title: "List",
  group: "data",
  parent: "Table",
  description: "A label/value list (definition list) for record-detail views — the non-tabular counterpart to Table/DataTable.",
  demos: [
    {
      name: "Default & Compact",
      render: () => (
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted mb-2">Default</p>
            <DataList items={items} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted mb-2">Compact</p>
            <DataList items={items} variant="compact" />
          </div>
        </div>
      ),
    },
    {
      name: "Striped",
      render: () => (
        <DataList items={items} className="[&>div:nth-child(odd)]:bg-secondary/50" />
      ),
    },
    {
      name: "Scrolling",
      render: () => (
        <div className="rounded-ui border border-border max-h-48 overflow-auto">
          <DataList items={manyItems} />
        </div>
      ),
    },
  ],
};
export default entry;
