import type { ShowcaseEntry } from "../../../showcase/types";
import { DataTable } from ".";

const users = [
  { name: "Alice", email: "alice@example.com", role: "Admin", status: "Active", sessions: 1245, lastLogin: "2026-07-17T10:30:00Z" },
  { name: "Bob", email: "bob@example.com", role: "Editor", status: "Active", sessions: 892, lastLogin: "2026-07-16T14:15:00Z" },
  { name: "Charlie", email: "charlie@example.com", role: "Viewer", status: "Inactive", sessions: 45, lastLogin: "2026-06-01T08:00:00Z" },
  { name: "Diana", email: "diana@example.com", role: "Editor", status: "Active", sessions: 2341, lastLogin: "2026-07-17T09:45:00Z" },
];

const statusVariants = [
  { label: "Neutral", value: "neutral" },
  { label: "Online", value: "success" },
  { label: "Warning", value: "warning" },
  { label: "Error", value: "danger" },
  { label: "Processing", value: "info" },
];

const entry: ShowcaseEntry = {
  title: "DataTable",
  group: "data",
  demos: [
    {
      name: "Default",
      render: () => (
        <DataTable
          columns={[
            { key: "name", header: "Name" },
            { key: "email", header: "Email", type: "email" },
            { key: "role", header: "Role", type: "badge", badgeVariant: "primary" },
            { key: "status", header: "Status", type: "status", statusVariant: (v) => v === "Active" ? "success" : "danger" },
            { key: "sessions", header: "Sessions", type: "number", align: "right" },
            { key: "lastLogin", header: "Last Login", type: "datetime" },
          ]}
          rows={users}
        />
      ),
    },
    {
      name: "Status variants",
      render: () => (
        <DataTable
          columns={[
            { key: "label", header: "Status" },
            { key: "value", header: "Indicator", type: "status", statusVariant: (v) => v as string },
          ]}
          rows={statusVariants}
        />
      ),
    },
    {
      name: "Striped + compact",
      render: () => (
        <DataTable
          variant="striped"
          density="compact"
          columns={[
            { key: "name", header: "Name" },
            { key: "email", header: "Email", type: "email" },
            { key: "role", header: "Role", type: "badge", badgeVariant: "primary" },
            { key: "sessions", header: "Sessions", type: "number", align: "right" },
          ]}
          rows={users}
        />
      ),
    },
  ],
};
export default entry;
