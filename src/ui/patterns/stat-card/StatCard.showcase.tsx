import type { ShowcaseEntry } from "../../../showcase/types";
import { StatCard } from ".";

const entry: ShowcaseEntry = {
  title: "StatCard",
  group: "patterns",
  demos: [
    {
      name: "Default",
      render: () => (
        <div className="flex flex-col gap-4">
          <StatCard label="Revenue" value="$12,345" delta={{ value: "12%", direction: "up" }} />
          <StatCard label="Users" value="1,234" delta={{ value: "8%", direction: "up", label: "vs last month" }} />
          <StatCard label="Bounce rate" value="24%" delta={{ value: "3%", direction: "down" }} />
        </div>
      ),
    },
  ],
};
export default entry;
