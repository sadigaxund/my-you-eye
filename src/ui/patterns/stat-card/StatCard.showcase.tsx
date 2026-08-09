import type { ShowcaseEntry } from "../../../showcase/types";
import { StatCard } from ".";

const entry: ShowcaseEntry = {
  title: "StatCard",
  group: "patterns",
  demos: [
    {
      name: "Default",
      render: () => (
        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
          <StatCard label="Revenue" value="$12,345" delta={{ value: "12%", direction: "up" }} />
          <StatCard label="Users" value="1,234" delta={{ value: "8%", direction: "up", label: "vs last month" }} />
          <StatCard label="Bounce rate" value="24%" delta={{ value: "3%", direction: "down" }} />
        </div>
      ),
    },
    {
      name: "Size",
      description: "size (sm/md/lg, default md) controls padding density, forwarded to CardContent — matches Card's own size scale.",
      render: () => (
        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
          <StatCard size="sm" label="Revenue (sm)" value="$12,345" delta={{ value: "12%", direction: "up" }} />
          <StatCard size="md" label="Revenue (md)" value="$12,345" delta={{ value: "12%", direction: "up" }} />
          <StatCard size="lg" label="Revenue (lg)" value="$12,345" delta={{ value: "12%", direction: "up" }} />
        </div>
      ),
    },
    {
      name: "Numeric delta",
      description: "delta.value as a number derives the arrow + success/danger/neutral color from its sign, formatted via src/lib/format.ts's formatSignedParts (the same logic CellType's `signed` display uses) — no direction prop needed.",
      render: () => (
        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
          <StatCard label="Latency (ms)" value="182" delta={{ value: -14.2, label: "vs last week" }} />
          <StatCard label="Error rate" value="0.4%" delta={{ value: 0.3, label: "vs last week" }} />
          <StatCard label="Churn" value="2.1%" delta={{ value: 0, label: "unchanged" }} />
        </div>
      ),
    },
    {
      name: "Icon + sparkline",
      description: "icon slot and an inline Sparkline (composes the standalone Sparkline component) reading the same trend.",
      render: () => (
        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
          <StatCard
            label="Active users"
            value="8,204"
            delta={{ value: 6.4, label: "vs last month" }}
            icon={<span className="text-xl">👤</span>}
            sparkline={{ data: [40, 44, 42, 48, 52, 50, 58, 63, 60, 68], area: true }}
          />
        </div>
      ),
    },
  ],
};
export default entry;
