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

const longValueItems = [
  {
    label: "Bio",
    type: "text" as const,
    value:
      "A very long unbroken sentence about this user that keeps going and going without any spaces to break on whatsoever, which used to blow out the container width before truncation was fixed.",
  },
  {
    label: "Homepage",
    type: "url" as const,
    value: "https://example.com/a/very/long/path/segment/that/keeps/nesting/deeper/and/deeper/into/the/url/structure?with=query&params=too",
  },
  {
    label: "API Key",
    type: "text" as const,
    value: "LMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  },
];

const entry: ShowcaseEntry = {
  title: "DataList",
  group: "data",
  parent: "Table",
  description: "A label/value list (definition list) for record-detail views — the non-tabular counterpart to Table/DataTable.",
  demos: [
    {
      name: "Default & Compact",
      render: () => (
        <div className="flex gap-6 max-w-2xl">
          <div className="flex-1 min-w-0 px-2">
            <DataList items={items} />
          </div>
          <div className="w-px bg-border shrink-0" />
          <div className="flex-1 min-w-0 px-2">
            <DataList items={items} variant="compact" />
          </div>
        </div>
      ),
    },
    {
      name: "Long values",
      description: "Long unbroken text, a long URL, and a long unbroken token — all must stay inside the container.",
      render: () => (
        <div className="w-full max-w-sm">
          <DataList items={longValueItems} />
        </div>
      ),
    },
  ],
};
export default entry;
