import { useState } from "react";
import type { ShowcaseEntry } from "../../../showcase/types";
import { DataTable } from ".";
import { Button } from "../../button";

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

function RowActionsDemo() {
  const [lastAction, setLastAction] = useState("");
  return (
    <div className="flex flex-col gap-2 max-w-2xl mx-auto">
      <DataTable
        columns={[
          { key: "name", header: "Name", width: "sm" },
          { key: "role", header: "Role", width: "xs" },
          { key: "status", header: "Status", width: "xs" },
        ]}
        rows={users.slice(0, 4)}
        rowKey={(row) => String(row.name)}
        actionsWidth="12%"
        onRowClick={(row) => setLastAction(`opened ${row.name}'s profile`)}
        renderActions={(row) => (
          <span className="inline-flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => setLastAction(`edited ${row.name}`)}>
              Edit
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setLastAction(`revoked ${row.name}`)}>
              Revoke
            </Button>
          </span>
        )}
      />
      <p className="text-xs text-muted text-center">
        {lastAction ? `Last action: ${lastAction}` : "Click a row, or use its trailing actions."}
      </p>
    </div>
  );
}

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
            { key: "lastLogin", header: "Last Login", type: "datetime-tz", width: "lg" },
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
            { key: "lastLogin", header: "Last Login", type: "datetime-tz", width: "lg" },
          ]}
          rows={users}
        />
      ),
    },
    {
      name: "Scrolling + sticky header",
      description: "Rounding lives on DataTable itself, which forwards it to its own ScrollArea, so the scrollbar's clip matches the border radius and never overlaps the top-right corner. The sticky header uses bg-surface-opaque, so scrolled rows never show through the seam.",
      render: () => (
        <DataTable
          stickyHeader
          className="max-h-72 rounded-ui border border-border"
          columns={[
            { key: "name", header: "Name", width: "sm" },
            { key: "email", header: "Email", type: "email", width: "lg" },
            { key: "role", header: "Role", type: "badge", badgeVariant: "primary", width: "xs" },
            { key: "status", header: "Status", type: "status", statusVariant: statusFromRole, width: "sm" },
            { key: "sessions", header: "Sessions", type: "number", align: "right", width: "xs" },
            { key: "lastLogin", header: "Last Login", type: "datetime-tz", width: "lg" },
          ]}
          rows={users}
        />
      ),
    },
    {
      name: "Alignment",
      description: "Numeric columns are right-aligned with tabular-nums (via CellType), the header/body cell horizontal padding is identical so columns line up under the sticky header, and header + body compute the same row height from matching padding at each density.",
      render: () => (
        <div className="flex flex-col gap-4">
          <DataTable
            stickyHeader
            className="max-h-56 rounded-ui border border-border"
            columns={[
              { key: "name", header: "Name", width: "lg" },
              { key: "small", header: "Small #", type: "number", align: "right", width: "sm" },
              { key: "big", header: "Large #", type: "number", align: "right", width: "sm" },
              { key: "pct", header: "Ratio", type: "percentage", align: "right", width: "sm" },
            ]}
            rows={[
              { name: "Row A", small: 1, big: 1234567, pct: 0.05 },
              { name: "Row B", small: 42, big: 8901, pct: 0.734 },
              { name: "Row C", small: 907, big: 23, pct: 0.9998 },
              { name: "Row D", small: 15, big: 456789, pct: 0.4 },
            ]}
          />
          <div className="flex gap-6">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted mb-1 font-mono">density: normal</p>
              <DataTable
                columns={[
                  { key: "name", header: "Name" },
                  { key: "n", header: "Count", type: "number", align: "right" },
                ]}
                rows={[{ name: "Alpha", n: 1204 }, { name: "Beta", n: 8 }]}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted mb-1 font-mono">density: compact</p>
              <DataTable
                density="compact"
                columns={[
                  { key: "name", header: "Name" },
                  { key: "n", header: "Count", type: "number", align: "right" },
                ]}
                rows={[{ name: "Alpha", n: 1204 }, { name: "Beta", n: 8 }]}
              />
            </div>
          </div>
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
    {
      name: "Row click & actions",
      description:
        "onRowClick opens the row's detail; renderActions adds a trailing per-row cell. Clicks on the action buttons stay with the buttons.",
      render: () => <RowActionsDemo />,
    },
  ],
};
export default entry;
