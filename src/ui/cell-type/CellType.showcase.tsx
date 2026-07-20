import type { ShowcaseEntry } from "../../showcase/types";
import type { ReactNode } from "react";
import { CellType } from ".";
import { cn } from "../../lib/cn";

function TableGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      role="table"
      className={cn(
        "grid w-full grid-cols-[180px_minmax(0,1fr)] text-sm",
        "[&>[role=row]:not(:first-of-type)>[role=columnheader]]:border-t [&>[role=row]:not(:first-of-type)>[role=columnheader]]:border-border",
        "[&>[role=row]:not(:first-of-type)>[role=cell]]:border-t [&>[role=row]:not(:first-of-type)>[role=cell]]:border-border",
        className,
      )}
    >
      {children}
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "CellType",
  group: "data",
  demos: [
    {
      name: "Data Types",
      render: () => (
        <TableGrid>
          <div role="row" className="contents">
            <div role="columnheader" className="p-3 min-w-0 font-medium text-muted whitespace-nowrap">Column</div>
            <div role="columnheader" className="p-3 min-w-0 font-medium text-muted">Value</div>
          </div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Text</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="text" value="Hello world" /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Boolean true</div><div role="cell" className="p-3 min-w-0"><CellType type="boolean" value={true} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Boolean false</div><div role="cell" className="p-3 min-w-0"><CellType type="boolean" value={false} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Email</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="email" value="user@example.com" /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">URL</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="url" value="https://example.com/path/abc123" replacements={[{ pattern: "https://example.com/path/abc123", label: "example.com/path" }]} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">URL as label</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="url" value="https://api.example.com/v2/docs?ref=abc" replacements={[{ pattern: "https://api.example.com/v2/docs?ref=abc", label: "API Docs →" }]} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">JSON</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="json" value={{ name: "Project X", count: 42, active: true, score: 98.5, url: "https://example.com", tags: ["frontend", "api", "docs", "admin", "editor", "viewer"], description: "Main application configuration with all feature flags and environment settings", metadata: { author: "team-core", createdAt: "2026-01-15", version: "2.4.1", environment: "production", region: "us-east-1", updatedAt: "2026-06-30" }, config: { timeout: 5000, retries: 3, flags: { cache: true, debug: false, logging: "verbose", maxConnections: 100, enableTls: true, allowedOrigins: ["*"], rateLimit: { requests: 1000, window: 60 } } } }} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Tree</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="tree" value={{ name: "Project X", active: true, score: 98.5, url: "https://example.com", description: "Main application configuration with all feature flags", tags: ["frontend", "api", "docs"], config: { timeout: 5000, retries: 3, flags: { cache: true, debug: false } }, metadata: { author: "team-core", createdAt: "2026-01-15", version: "2.4.1" } }} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">List</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="array" value={["frontend", "api", "docs", "admin", "editor", "viewer"]} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Null</div><div role="cell" className="p-3 min-w-0"><CellType type="null" /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Badge</div><div role="cell" className="p-3 min-w-0"><CellType type="badge" value="Active" badgeVariant="success" /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Status</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="status" value="Running" statusVariant="info" statusPulse /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Image</div><div role="cell" className="p-3 min-w-0"><CellType type="image" value="https://picsum.photos/seed/cv/80/80" /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Audio</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="audio" value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" /></div></div>
        </TableGrid>
      ),
    },
    {
      name: "Numeric types",
      render: () => (
        <TableGrid>
          <div role="row" className="contents">
            <div role="columnheader" className="p-3 min-w-0 font-medium text-muted whitespace-nowrap">Type</div>
            <div role="columnheader" className="p-3 min-w-0 font-medium text-muted">Value</div>
          </div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Number</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="number" value={1234567.89} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Percentage</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="percentage" value={0.123} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Bytes (human)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="bytes" value={2048} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Bytes (human, large)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="bytes" value={1073741824} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Bytes (forced MB)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="bytes" value={5368709120} displayUnit="MB" /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Duration</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="duration" value={3661} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Duration (seconds)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="duration" value={45} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Date (Human)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="date-human" value="2026-06-01" /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Date (Human - now)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="date-human" value={new Date().toISOString()} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Date (System)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="date-system" value="2026-07-17" /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Date (System - custom)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="date-system" value="2026-07-17" dateFormat={{ weekday: "long", year: "numeric", month: "long", day: "numeric" }} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">DateTime TZ</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="datetime-tz" value="2026-07-17T12:00:00Z" /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Currency</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="currency" value={1234.56} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Currency (compact)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="currency" value={1234567.89} compact /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Currency (EUR)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="currency" value={99.95} currency="EUR" /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Number (4 decimals)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="number" value={1234.5678} fractionDigits={4} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Percentage (3 decimals)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="percentage" value={0.12345} fractionDigits={3} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Signed</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="signed" value={42.5} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Signed negative</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="signed" value={-17.3} /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Number (compact)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="number" value={1234567} compact /></div></div>
          <div role="row" className="contents"><div role="cell" className="p-3 min-w-0 whitespace-nowrap">Bytes (compact)</div><div role="cell" className="p-3 min-w-0 [&>*]:w-full"><CellType type="bytes" value={1073741824} compact /></div></div>
        </TableGrid>
      ),
    },
  ],
};
export default entry;
