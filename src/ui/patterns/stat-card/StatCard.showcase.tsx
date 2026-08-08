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
  ],
};
export default entry;
