import type { ShowcaseEntry } from "../../showcase/types";
import { DataList } from ".";

const items = [
  { label: "Name", value: "John Doe", type: "text" as const },
  { label: "Email", value: "john@example.com", type: "email" as const },
  { label: "Active", value: true, type: "boolean" as const },
  { label: "Role", value: "Admin", type: "badge" as const, badgeVariant: "primary" as const },
  { label: "Status", value: "Online", type: "status" as const, statusVariant: "success" as const, statusPulse: true },
  { label: "Website", value: "https://example.com/john", type: "url" as const, replacements: [{ pattern: "john", label: "..." }] },
];

const entry: ShowcaseEntry = {
  title: "DataList",
  group: "data",
  demos: [
    {
      name: "Key-value list",
      render: () => (
        <div className="max-w-sm">
          <DataList items={items} />
        </div>
      ),
    },
    {
      name: "Compact variant",
      render: () => (
        <div className="max-w-sm">
          <DataList items={items} variant="compact" />
        </div>
      ),
    },
  ],
};
export default entry;
