import type { ShowcaseEntry } from "../../../showcase/types";
import { DataTable } from ".";

const users = [
  { name: "Alice", email: "alice@example.com", role: "Admin", status: "Active", sessions: 1245, lastLogin: "2026-07-17T10:30:00Z" },
  { name: "Bob", email: "bob@example.com", role: "Editor", status: "Active", sessions: 892, lastLogin: "2026-07-16T14:15:00Z" },
  { name: "Charlie", email: "charlie@example.com", role: "Viewer", status: "Inactive", sessions: 45, lastLogin: "2026-06-01T08:00:00Z" },
  { name: "Diana", email: "diana@example.com", role: "Editor", status: "Active", sessions: 2341, lastLogin: "2026-07-17T09:45:00Z" },
  { name: "Eve", email: "eve@example.com", role: "Admin", status: "Active", sessions: 3102, lastLogin: "2026-07-17T11:00:00Z" },
  { name: "Frank", email: "frank@example.com", role: "Viewer", status: "Inactive", sessions: 12, lastLogin: "2026-03-15T16:30:00Z" },
  { name: "Grace", email: "grace@example.com", role: "Editor", status: "Active", sessions: 1567, lastLogin: "2026-07-16T08:20:00Z" },
  { name: "Ivy", email: "ivy@example.com", role: "Admin", status: "Warning", sessions: 2891, lastLogin: "2026-07-17T07:30:00Z" },
  { name: "Leo", email: "leo@example.com", role: "Admin", status: "Active", sessions: 5678, lastLogin: "2026-07-17T13:45:00Z" },
  { name: "Olivia", email: "olivia@example.com", role: "Admin", status: "Danger", sessions: 4567, lastLogin: "2026-07-17T06:15:00Z" },
];

const statusFromRole = (v: unknown) =>
  v === "Active" ? "success" : v === "Warning" ? "warning" : v === "Danger" ? "danger" : "neutral";

const entry: ShowcaseEntry = {
  title: "DataTable",
  group: "data",
  parent: "Table",
  description: "A composed table pattern that renders columns + rows through CellType, with variant/density options and an optional sticky header.",
  demos: [
    {
      name: "Default",
      render: () => (
        <DataTable
          columns={[
            { key: "name", header: "Name", width: "sm" },
            { key: "email", header: "Email", type: "email", width: "lg" },
            { key: "role", header: "Role", type: "badge", badgeVariant: "primary", width: "xs" },
            { key: "status", header: "Status", type: "status", statusVariant: statusFromRole, width: "sm" },
            { key: "sessions", header: "Sessions", type: "number", align: "right", width: "xs" },
            { key: "lastLogin", header: "Last Login", type: "datetime-tz", width: "md" },
          ]}
          rows={users}
        />
      ),
    },
    {
      name: "Striped",
      render: () => (
        <DataTable
          variant="striped"
          columns={[
            { key: "name", header: "Name", width: "sm" },
            { key: "email", header: "Email", type: "email", width: "lg" },
            { key: "role", header: "Role", type: "badge", badgeVariant: "primary", width: "xs" },
            { key: "status", header: "Status", type: "status", statusVariant: statusFromRole, width: "sm" },
            { key: "sessions", header: "Sessions", type: "number", align: "right", width: "xs" },
            { key: "lastLogin", header: "Last Login", type: "datetime-tz", width: "md" },
          ]}
          rows={users}
        />
      ),
    },
    {
      name: "Scrolling + sticky header",
      render: () => (
        <div className="rounded-ui border border-border">
          <DataTable
            stickyHeader
            className="max-h-72"
            columns={[
              { key: "name", header: "Name", width: "sm" },
              { key: "email", header: "Email", type: "email", width: "lg" },
              { key: "role", header: "Role", type: "badge", badgeVariant: "primary", width: "xs" },
              { key: "status", header: "Status", type: "status", statusVariant: statusFromRole, width: "sm" },
              { key: "sessions", header: "Sessions", type: "number", align: "right", width: "xs" },
              { key: "lastLogin", header: "Last Login", type: "datetime-tz", width: "md" },
            ]}
            rows={users}
          />
        </div>
      ),
    },
    {
      name: "Truncation",
      render: () => (
        <div className="flex flex-col">
          <div>
            <p className="text-xs text-muted mb-1">Text & Links</p>
            <DataTable
              density="compact"
              columns={[
                { key: "text", header: "Text", type: "text" },
                { key: "email", header: "Email", type: "email" },
                { key: "url", header: "URL", type: "url" },
              ]}
              rows={[{
                text: "The quick brown fox jumps over the lazy dog near the riverbank while waiting for the bus",
                email: "very.long.email.address@subdomain.verylongdomainname.com",
                url: "https://subdomain.example.com/very/long/path/with/many/segments?param1=value1&param2=value2",
              }]}
            />
          </div>
          <hr className="border-border/20 my-3" />
          <div>
            <p className="text-xs text-muted mb-1">Complex</p>
            <DataTable
              density="compact"
              columns={[
                { key: "json", header: "JSON", type: "json" },
                { key: "tree", header: "Tree", type: "tree" },
                { key: "tag", header: "List", type: "array" },
              ]}
              rows={[{
                json: { environment: "production", region: "us-east-1", replicas: 6, autoscaling: { min: 3, max: 12, targetCpu: 75 } },
                tree: { environment: "production", region: "us-east-1", zone: "a", instanceType: "t3.large", features: { caching: true, compression: true, logging: "verbose" }, monitoring: { enabled: true, endpoint: "/health", interval: 30 } },
                tag: ["authentication", "authorization", "encryption", "key-management", "audit-logging", "rate-limiting"],
              }]}
            />
          </div>

        </div>
      ),
    },
  ],
};
export default entry;
